import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('products')
  getProducts() {
    return this.appService.getProducts();
  }

  @Get('products/:productId')
  getProductById(@Param('productId', ParseIntPipe) productId: number) {
    return this.appService.getProductById(productId);
  }

  @Get('products/:productId/reviews')
  getProductReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.appService.getProductReviews(productId);
  }

  @Post('products/:productId/reviews')
  createProductReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: { userId: number; rating: number; comment: string; title?: string },
  ) {
    return this.appService.createReview(productId, body);
  }

  @Get('reviews')
  getReviewsFeed() {
    return this.appService.getReviewsFeed();
  }

  @Post('products')
  createProduct(
    @Body()
    body: {
      sku: string;
      name: string;
      description?: string;
      categoryId?: number;
      categoryName?: string;
      price: number;
      discountPrice?: number;
      quantityInStock?: number;
      imageUrl?: string;
      thumbnailUrl?: string;
      isFeatured?: boolean;
    },
  ) {
    return this.appService.createProduct(body);
  }

  @Post('auth/register')
  register(
    @Body()
    body: {
      email: string;
      username: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ) {
    return this.appService.register(body);
  }

  @Post('auth/login')
  login(@Body() body: { identifier: string; password: string }) {
    return this.appService.login(body);
  }

  @Get('auth/demo-user')
  getDemoUser() {
    return this.appService.getOrCreateDemoUser();
  }

  @Get('cart/:userId')
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.appService.getCartByUserId(userId);
  }

  @Post('cart/:userId/items')
  addCartItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { productId: number; quantity?: number },
  ) {
    return this.appService.addCartItem(userId, body);
  }

  @Post('checkout')
  checkout(
    @Body()
    body: {
      userId: number;
      paymentMethod?: string;
      shippingAddress: string;
      shippingCity?: string;
      shippingPostalCode?: string;
      shippingCountry?: string;
    },
  ) {
    return this.appService.checkout(body);
  }
}
