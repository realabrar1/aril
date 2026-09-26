<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Customer Registration
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->registerCustomer($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data' => $result,
        ], 201);
    }

    /**
     * Login (Customer or Admin)
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated()['email'],
            $request->validated()['password']
        );

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => $result,
        ], 200);
    }

    /**
     * Get Current Authenticated User details
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $roles = $user->roles()->pluck('name')->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Authenticated user profile retrieved.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'user_type' => $user->user_type,
                    'status' => $user->status,
                    'roles' => $roles,
                    'email_verified' => !is_null($user->email_verified_at),
                ],
            ],
        ], 200);
    }

    /**
     * Logout User
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logout successful.',
        ], 200);
    }

    /**
    /**
     * Request Password Reset Link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->input('email')));
        $user = \App\Models\User::where('email', $email)->first();

        if ($user) {
            try {
                $token = \Illuminate\Support\Str::random(64);
                
                \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $email],
                    [
                        'token' => \Illuminate\Support\Facades\Hash::make($token),
                        'created_at' => now(),
                    ]
                );

                $frontendUrl = env('FRONTEND_URL', 'https://arilha.com');
                $resetLink = "{$frontendUrl}/login/reset-password?token={$token}&email=" . urlencode($user->email);

                \App\Jobs\SendEmailNotificationJob::dispatch(
                    'password_reset',
                    $user->email,
                    $user->name,
                    [
                        'customer_name' => $user->name,
                        'reset_link' => $resetLink,
                        'email' => $user->email,
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("AuthController: Failed to queue password reset email: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'If your email is registered, a password reset link has been sent to your inbox.',
        ], 200);
    }

    /**
     * Reset Password and update database
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = strtolower(trim($request->input('email')));
        $token = $request->input('token');
        $newPassword = $request->input('password');

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset link.',
            ], 422);
        }

        $isValidToken = \Illuminate\Support\Facades\Hash::check($token, $record->token) || $token === $record->token;

        if (!$isValidToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password reset token.',
            ], 422);
        }

        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Password reset token has expired. Please request a new link.',
            ], 422);
        }

        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User account not found.',
            ], 404);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($newPassword);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been successfully updated. You can now login with your new password.',
        ], 200);
    }

    /**
     * Verify Email Placeholder
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Email verification request processed.',
        ], 200);
    }

    /**
     * Google Sign-In / Sign-Up API Endpoint
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $idToken = $request->input('id_token') ?: $request->input('credential');
        $code = $request->input('code');

        $googlePayload = null;

        if ($idToken) {
            // Verify ID Token directly with Google's official TokenInfo endpoint
            $googleResp = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if (!$googleResp->successful() || empty($googleResp->json('email'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired Google credential.',
                ], 422);
            }

            $googlePayload = $googleResp->json();
        } elseif ($code) {
            $clientId = config('services.google.client_id', env('GOOGLE_CLIENT_ID'));
            $clientSecret = config('services.google.client_secret', env('GOOGLE_CLIENT_SECRET'));
            $redirectUri = config('services.google.redirect_uri', env('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/v1/auth/google/callback'));

            $tokenResp = \Illuminate\Support\Facades\Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'grant_type' => 'authorization_code',
                'code' => $code,
            ]);

            if (!$tokenResp->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to exchange Google authorization code.',
                ], 422);
            }

            $idTokenFromCode = $tokenResp->json('id_token');
            if ($idTokenFromCode) {
                $googleResp = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $idTokenFromCode,
                ]);
                $googlePayload = $googleResp->json();
            } else {
                $userResp = \Illuminate\Support\Facades\Http::withToken($tokenResp->json('access_token'))
                    ->get('https://www.googleapis.com/oauth2/v3/userinfo');
                $googlePayload = $userResp->json();
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Missing Google credential or authorization code.',
            ], 422);
        }

        try {
            $guestSessionId = $request->header('X-Guest-Session-ID') ?: $request->input('guest_session_id');
            $result = $this->authService->googleLogin($googlePayload, $guestSessionId);

            return response()->json([
                'success' => true,
                'message' => 'Google login successful.',
                'data' => $result,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first() ?: 'Google authentication failed.',
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Redirect to Google OAuth Consent Page via Laravel Socialite with direct fallback
     */
    public function googleRedirect(): JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
    {
        try {
            return \Laravel\Socialite\Facades\Socialite::driver('google')
                ->stateless()
                ->redirect();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("AuthController googleRedirect: Socialite failed ({$e->getMessage()}), using direct OAuth redirect.");
        }

        // Direct Google OAuth URL fallback
        $clientId = config('services.google.client_id') ?: env('GOOGLE_CLIENT_ID', '1042125952884-m68nnefo4hc8nqknodjppd4d609flabb.apps.googleusercontent.com');
        $redirectUri = config('services.google.redirect') ?: env('GOOGLE_REDIRECT_URI', 'https://arilha.com/auth/google/callback');

        $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);

        return redirect()->away($url);
    }

    /**
     * Google OAuth Callback Endpoint via Laravel Socialite
     */
    public function googleCallback(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://arilha.com'), '/');

        if ($request->has('error')) {
            $errorReason = $request->input('error_description') ?: $request->input('error');
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode($errorReason));
        }

        try {
            $googleUser = \Laravel\Socialite\Facades\Socialite::driver('google')->stateless()->user();

            $googlePayload = [
                'id' => $googleUser->getId(),
                'sub' => $googleUser->getId(),
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName() ?: 'Google Customer',
                'picture' => $googleUser->getAvatar(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified' => true,
            ];

            $guestSessionId = $request->header('X-Guest-Session-ID') ?: $request->input('guest_session_id');
            $result = $this->authService->googleLogin($googlePayload, $guestSessionId);

            $token = $result['token'];
            $userJson = urlencode(json_encode($result['user']));

            return redirect()->away("{$frontendUrl}/auth/google/callback?token={$token}&user={$userJson}");
        } catch (\Throwable $e) {
            // Fallback for code parameter exchange if direct Socialite code exchange hit state/network mismatch
            if ($request->has('code')) {
                $response = $this->googleLogin($request);
                $data = $response->getData(true);

                if (!empty($data['success']) && !empty($data['data']['token'])) {
                    $token = $data['data']['token'];
                    $userJson = urlencode(json_encode($data['data']['user']));
                    return redirect()->away("{$frontendUrl}/auth/google/callback?token={$token}&user={$userJson}");
                }
            }

            return redirect()->away("{$frontendUrl}/login?error=" . urlencode('Google authentication failed: ' . $e->getMessage()));
        }
    }

    /**
     * Send Passwordless OTP via Email or Phone
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string|max:255',
        ]);

        $identifier = strtolower(trim($request->input('identifier')));
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL) !== false;
        $isPhone = preg_match('/^[0-[#]?\+?[0-9]{10,15}$/', $identifier);

        if (!$isEmail && !$isPhone) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid email address or 10-digit phone number.',
            ], 422);
        }

        // Rate limiting check
        $existing = \App\Models\Otp::where('identifier', $identifier)->first();
        if ($existing && $existing->last_sent_at && \Carbon\Carbon::parse($existing->last_sent_at)->addSeconds(60)->isFuture()) {
            $remaining = 60 - \Carbon\Carbon::parse($existing->last_sent_at)->diffInSeconds(now());
            return response()->json([
                'success' => false,
                'message' => "Please wait {$remaining} seconds before requesting another OTP.",
            ], 429);
        }

        $otp = (string) rand(100000, 999999);
        $otpHash = \Illuminate\Support\Facades\Hash::make($otp);

        \App\Models\Otp::updateOrCreate(
            ['identifier' => $identifier],
            [
                'otp_hash' => $otpHash,
                'expires_at' => now()->addMinutes(10),
                'attempts_count' => 0,
                'last_sent_at' => now(),
            ]
        );

        // Send OTP Notification if email
        if ($isEmail) {
            try {
                \App\Jobs\SendEmailNotificationJob::dispatch(
                    'login_otp',
                    $identifier,
                    'Valued Customer',
                    ['otp' => $otp, 'identifier' => $identifier]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("AuthController sendOtp email failed: " . $e->getMessage());
            }
        }

        $responsePayload = [
            'success' => true,
            'message' => "OTP sent successfully to {$identifier}.",
        ];

        return response()->json($responsePayload, 200);
    }

    /**
     * Verify Passwordless OTP and Login Customer
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string|max:255',
            'otp' => 'required|string|min:4|max:10',
        ]);

        $identifier = strtolower(trim($request->input('identifier')));
        $otp = trim($request->input('otp'));

        $record = \App\Models\Otp::where('identifier', $identifier)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'No pending OTP request found for this email or phone number. Please request a new OTP.',
            ], 422);
        }

        if (\Carbon\Carbon::parse($record->expires_at)->isPast()) {
            $record->delete();
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please request a new code.',
            ], 422);
        }

        if ($record->attempts_count >= 5) {
            $record->delete();
            return response()->json([
                'success' => false,
                'message' => 'Maximum verification attempts exceeded. Please request a new OTP.',
            ], 422);
        }

        $isValid = \Illuminate\Support\Facades\Hash::check($otp, $record->otp_hash);

        if (!$isValid) {
            $record->increment('attempts_count');
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code. Please check and try again.',
            ], 422);
        }

        // OTP Verified successfully -> Delete OTP record
        $record->delete();

        // Find or create customer account
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL) !== false;
        $user = null;

        if ($isEmail) {
            $user = \App\Models\User::where('email', $identifier)->first();
        } else {
            $user = \App\Models\User::where('phone', $identifier)->first();
        }

        if (!$user) {
            $name = $isEmail ? explode('@', $identifier)[0] : 'Customer';
            $email = $isEmail ? $identifier : ($identifier . '@customer.arilha.com');
            $phone = $isEmail ? null : $identifier;

            $user = \App\Models\User::create([
                'name' => ucwords($name),
                'email' => $email,
                'phone' => $phone,
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(16)),
                'user_type' => 'CUSTOMER',
                'status' => 'ACTIVE',
            ]);
        }

        // Generate Sanctum token
        $token = $user->createToken('customer-otp-token')->plainTextToken;
        $roles = $user->roles()->pluck('name')->toArray();

        // Merge guest cart into user's cart if guest_session_id header present
        $guestSessionId = $request->header('X-Guest-Session-ID') ?: $request->input('guest_session_id');
        if (!empty($guestSessionId)) {
            try {
                $cartService = app(\App\Services\CartService::class);
                $cartService->mergeCart($guestSessionId, $user);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("AuthController verifyOtp cart merge failed: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully. You are now signed in.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'user_type' => $user->user_type,
                    'status' => $user->status,
                    'roles' => $roles,
                    'email_verified' => true,
                ],
            ],
        ], 200);
    }
}
