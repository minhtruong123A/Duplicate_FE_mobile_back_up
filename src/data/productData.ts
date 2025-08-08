// src/data/productData.ts
import { fakeUserData } from './userData';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type ProductCard = {
    id: string;
    name: string;
    collection: string;
    price: number;
    quantity: number;
    sellerId: string; // <-- Đổi từ object sang ID
    imageUrl: string;
    description: string;
    rateName: Rarity;
    rating: number; // <-- Thêm rating
    reviewCount: number; // <-- Thêm số lượt review
};

export const fakeProductData: ProductCard[] = [
    {
        id: 'prod001',
        name: 'Juuzou Suzuya - Character Art',
        collection: 'Tokyo Ghoul',
        price: 100000,
        quantity: 5,
        sellerId: 'user001',
        imageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/EpicCardNo1TokyoGhoul.png',
        description: 'Một thẻ bài nghệ thuật độc đáo khắc họa Juuzou Suzuya, một trong những điều tra viên đặc biệt nhất.',
        rateName: 'Epic',
        rating: 4.8,
        reviewCount: 120,
    },
    {
        id: 'prod002',
        name: 'Ghoul Eyes - Abstract Panel Art',
        collection: 'Tokyo Ghoul',
        price: 100000,
        quantity: 3,
        sellerId: 'user001',
        imageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/UncommonCardNo2TokyoGhoul.png',
        description: 'Ánh mắt đầy ám ảnh của một Ghoul được thể hiện qua phong cách nghệ thuật trừu tượng, đầy ấn tượng.',
        rateName: 'Uncommon',
        rating: 4.5,
        reviewCount: 85,
    },
    {
        id: 'prod003',
        name: 'Ghoul Eyes - Abstract Panel Art',
        collection: 'Tokyo Ghoul',
        price: 100000,
        quantity: 1,
        sellerId: 'user002',
        imageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/UncommonCardNo2TokyoGhoul.png',
        description: 'Một phiên bản khác của "Ghoul Eyes" được bán bởi một nhà sưu tập khác, tạo nên sự đa dạng cho thị trường.',
        rateName: 'Uncommon',
        rating: 4.6,
        reviewCount: 92,
    },
];
