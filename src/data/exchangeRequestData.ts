// src/data/exchangeRequestData.ts

export type ExchangeRequest = {
    id: string;
    requesterName: string;
    requesterAvatar: string;
    offeredItemName: string;
    offeredItemImageUrl: string;
    requestedItemName: string;
    requestedItemImageUrl: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
};

export const fakeExchangeRequestData: ExchangeRequest[] = [
    {
        id: 'ex001',
        requesterName: 'Yugi',
        requesterAvatar: 'https://i.pravatar.cc/150?img=7',
        offeredItemName: 'Thẻ bài Phù Thủy Bóng Tối',
        offeredItemImageUrl: 'https://placehold.co/100x140/8A2BE2/FFFFFF?text=Card',
        requestedItemName: 'Thẻ bài Rồng Lửa Huyền Thoại',
        requestedItemImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/OnePiece_Card_1.png',
        status: 'Pending',
    },
    {
        id: 'ex002',
        requesterName: 'Kaiba',
        requesterAvatar: 'https://i.pravatar.cc/150?img=8',
        offeredItemName: 'Hộp Bí Ẩn Hoàng Gia',
        offeredItemImageUrl: 'https://placehold.co/100x100/4682B4/FFFFFF?text=Box',
        requestedItemName: 'Juuzou Suzuya - Character Art',
        requestedItemImageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/EpicCardNo1TokyoGhoul.png',
        status: 'Accepted',
    },
];
