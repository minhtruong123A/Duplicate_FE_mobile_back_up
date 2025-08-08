// src/data/auctionData.ts

export type Bid = {
    id: string;
    bidderName: string;
    amount: number;
    timestamp: string;
};

export type Auction = {
    id: string;
    productName: string;
    productImageUrl: string;
    startingPrice: number;
    currentBid: number;
    bidCount: number;
    endTime: Date;
    biddingHistory: Bid[];
};

const now = new Date();

export const fakeAuctionData: Auction[] = [
    {
        id: 'auc001',
        productName: 'Thẻ bài Rồng Lửa Huyền Thoại (Mint Condition)',
        productImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/OnePiece_Card_1.png',
        startingPrice: 500000,
        currentBid: 750000,
        bidCount: 8,
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Kết thúc sau 2 giờ
        biddingHistory: [
            { id: 'b1', bidderName: 'Kaiba', amount: 750000, timestamp: '5 phút trước' },
            { id: 'b2', bidderName: 'Yugi', amount: 720000, timestamp: '10 phút trước' },
            { id: 'b3', bidderName: 'Joey', amount: 680000, timestamp: '15 phút trước' },
        ],
    },
    {
        id: 'auc002',
        productName: 'Juuzou Suzuya - Character Art (Limited)',
        productImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/EpicCardNo1TokyoGhoul.png',
        startingPrice: 80000,
        currentBid: 150000,
        bidCount: 12,
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Kết thúc sau 1 ngày
        biddingHistory: [
            { id: 'b4', bidderName: 'Arima', amount: 150000, timestamp: '1 giờ trước' },
            { id: 'b5', bidderName: 'Kaneki', amount: 140000, timestamp: '2 giờ trước' },
        ],
    },
];
