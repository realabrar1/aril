@extends('emails.layout')

@section('content')
<h2 class="h2-title">Welcome to ARILHA, {{ $customer_name ?? $user['name'] ?? 'Valued Customer' }}!</h2>
<p class="paragraph">
    Thank you for joining ARILHA by Irsa Khan. We are delighted to welcome you to our community of modern Indian jewellery made for everyday wear and special moments.
</p>
<p class="paragraph">
    Explore our curated collections of anti-tarnish everyday jewellery, Kundan & festive statement pieces, gold-plated earrings, necklaces, bangles, and rings designed for every version of you.
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="https://arilha.com/shop" class="btn">Explore Collections</a>
</div>

<p class="paragraph" style="font-size: 12px; color: #7A7A7A; text-align: center;">
    Enjoy Free Shipping on orders above ₹1,499 & 7-Day Hassle-Free Returns.
</p>
@endsection
