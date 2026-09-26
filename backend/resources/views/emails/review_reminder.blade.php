@extends('emails.layout')

@section('content')
<h2 class="h2-title">How are you loving your Arilha jewellery? 💕</h2>
<p class="paragraph">
    Hi {{ $customer_name ?? 'Valued Customer' }},
</p>
<p class="paragraph">
    We hope you're enjoying your recent Arilha jewellery order (<strong>#{ $order_number ?? '' }</strong>). We'd love to know what you think about your new pieces.
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $review_url ?? '/account/orders' }}" style="background-color: #B38548; color: #ffffff; padding: 14px 28px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
        Write a Review →
    </a>
</div>

<p class="paragraph" style="font-size: 13px; color: #7A7A7A;">
    Your feedback helps other jewellery lovers find their perfect style!
</p>
@endsection
