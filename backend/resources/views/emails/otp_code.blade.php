@extends('emails.layout')

@section('content')
<h2 class="h2-title">Your Arilha Verification Code</h2>
<p class="paragraph">
    Hi {{ $customer_name ?? 'Valued Customer' }},
</p>
<p class="paragraph">
    Your Arilha verification code is:
</p>

<div style="text-align: center; margin: 25px 0;">
    <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #B38548; background: #FAF4EB; padding: 12px 28px; border-radius: 12px; border: 1px solid #EFE6D8; display: inline-block;">
        {{ $otp }}
    </span>
</div>

<p class="paragraph">
    This OTP is valid for 10 minutes.
</p>

<p class="paragraph" style="font-size: 13px; color: #7A7A7A; margin-top: 20px;">
    If you didn't request this code, you can safely ignore this email.
</p>
<p class="paragraph" style="font-size: 13px; color: #7A7A7A;">
    Regards,<br>
    <strong>Arilha Jewellery</strong>
</p>
@endsection
