@extends('emails.layout')

@section('content')
<h2 class="h2-title">Arilha Login OTP</h2>
<p class="paragraph">
    Your verification code is:
</p>

<div style="text-align: center; margin: 25px 0;">
    <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1E1B18; background: #F7F5F0; padding: 12px 24px; border-radius: 8px; border: 1px solid #E5DFD5; display: inline-block;">
        {{ $otp }}
    </span>
</div>

<p class="paragraph">
    This code expires in 10 minutes.
</p>

<p class="paragraph" style="font-size: 13px; color: #7A7A7A; margin-top: 20px;">
    If you did not request this code, you can ignore this email.
</p>
@endsection
