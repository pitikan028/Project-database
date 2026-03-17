import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Product } from './product.entity';

@Entity('wishlist_items')
@Unique(['wishlist', 'product'])
export class WishlistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wishlist, wishlist => wishlist.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @ManyToOne(() => Product, product => product.wishlistItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  addedAt: Date;
}
