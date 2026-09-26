@extends('emails.layout')

@section('content')
<h2 class="h2-title">You left something beautiful behind 💕</h2>
<p class="paragraph">
    Hi {{ $customer_name ?? 'Valued Customer' }},
</p>
<p class="paragraph">
    You left some beautiful Arilha jewellery pieces in your cart. Your selected pieces are still waiting for you!
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $recovery_url }}" style="background-color: #B38548; color: #ffffff; padding: 14px 28px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
        Return to My Cart →
    </a>
</div>

<p class="paragraph" style="font-size: 13px; color: #7A7A7A; margin-top: 20px;">
    Need help completing your order? Reply directly to this email and our customer concierge team will assist you.
</p>
@endsection
