// src/data/orderData.ts

export type Order = {
    id: string;
    productName: string;
    productImageUrl: string;
    price: number;
    date: string;
    status: 'Completed' | 'Pending' | 'Cancelled';
    type: 'buy' | 'sell';
};

export const fakeOrderData: Order[] = [
    {
        id: 'order001',
        productName: 'Thẻ bài Rồng Lửa Huyền Thoại',
        productImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/OnePiece_Card_1.png',
        price: 750000,
        date: '01/08/2025',
        status: 'Completed',
        type: 'buy',
    },
    {
        id: 'order002',
        productName: 'Hộp Bí Ẩn Huyền Thoại',
        productImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/TokyoGhoul_Boxset.png',
        price: 20000,
        date: '28/07/2025',
        status: 'Completed',
        type: 'sell',
    },
    {
        id: 'order003',
        productName: 'Ghoul Eyes - Abstract Panel Art',
        productImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/UncommonCardNo2TokyoGhoul.png',
        price: 100000,
        date: '25/07/2025',
        status: 'Cancelled',
        type: 'buy',
    },
];
