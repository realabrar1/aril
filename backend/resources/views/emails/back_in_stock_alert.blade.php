@extends('emails.layout')

@section('content')
<h2 class="h2-title">It's back! Your Arilha favourite is available 💕</h2>
<p class="paragraph">
    Hi {{ $customer_name ?? 'Valued Customer' }},
</p>
<p class="paragraph">
    Good news! The jewellery piece you were waiting for (<strong>{{ $product_name ?? 'Jewellery Product' }}</strong>) is back in stock.
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $product_url ?? '/shop' }}" style="background-color: #111827; color: #ffffff; padding: 14px 28px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
        Shop Now →
    </a>
</div>

<p class="paragraph" style="font-size: 13px; color: #7A7A7A;">
    Hurry! Stock is limited for this restocked design.
</p>
@endsection
