export type MysteryBox = {
    id: string;
    name: string;
    collection: string;
    price: number;
    imageUrl: string;
    description: string;
    itemsInside: string[];
};

// --- DỮ LIỆU GIẢ (FAKE DATA) ---
// Dữ liệu bây giờ nằm ở đây để các file khác có thể import
export const fakeBoxData: MysteryBox[] = [
    {
        id: 'box001',
        name: 'Tokyo Ghoul Fan Art & Merchandise Designs',
        collection: 'Tokyo Ghoul',
        price: 20000,
        imageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/TokyoGhoul_Boxset.png',
        description: 'Hòa mình vào thế giới đen tối và quyến rũ của Tokyo Ghoul với bộ hộp độc quyền này. Chứa các bản in fan art chất lượng cao và hàng hóa độc đáo lấy cảm hứng từ các nhân vật yêu thích của bạn.',
        itemsInside: ['5x Thẻ bài nghệ thuật', '1x Móc khóa', '1x Bộ nhãn dán', '1x Poster phiên bản đặc biệt'],
    },
    {
        id: 'box002',
        name: 'One Piece Set 1: Flames of Brotherhood',
        collection: 'One Piece',
        price: 20000,
        imageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/OnePiece_Boxset.png',
        description: 'Tôn vinh mối liên kết không thể phá vỡ của Ace, Sabo và Luffy. Chiếc hộp này chứa đầy những món đồ sưu tầm ghi lại tinh thần rực lửa của những người anh em kết nghĩa.',
        itemsInside: ['3x Thẻ nhân vật', '1x Huy hiệu men', '1x Tượng nhỏ mini', '1x Dây đeo theo chủ đề'],
    },
    {
        id: 'box003',
        name: 'Spy x Family Anime Art Card Collection',
        collection: 'Spy x Family',
        price: 20000,
        imageUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/SpyxFamily_Boxset.png',
        description: 'Một bộ sưu tập trang nhã dành cho những người hâm mộ gia đình Forger. Khám phá các nhiệm vụ bí mật và những khoảnh khắc ấm lòng với những tấm thẻ nghệ thuật và phụ kiện được thiết kế đẹp mắt này.',
        itemsInside: ['10x Thẻ bài nghệ thuật', '2x Bộ nhãn dán', '1x Huy hiệu Anya', '1x Móc khóa Loid & Yor'],
    },
];
