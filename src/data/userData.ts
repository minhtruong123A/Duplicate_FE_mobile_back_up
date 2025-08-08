// src/data/userData.ts

export type Seller = {
    id: string;
    name: string;
    avatarUrl: string;
};

export const fakeUserData: Seller[] = [
    {
        id: 'user001',
        name: 'MinhTruong',
        avatarUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/5804dc84-a559-4ea1-b887-6db398a4b56b.jpg',
    },
    {
        id: 'user002',
        name: 'Yukihana',
        avatarUrl: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/e4adb2d7-49b8-440f-af46-dea902e70707.jpeg',
    },
];
