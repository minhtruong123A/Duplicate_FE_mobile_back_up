import React, { useState, useMemo } from 'react';
import { Image, ImageProps } from 'react-native';
import { buildImageUrl } from '../services/api.imageproxy'; // Đảm bảo đường dẫn đúng

// Mở rộng ImageProps để nhận thêm urlPath
interface ApiImageProps extends Omit<ImageProps, 'source'> {
    urlPath: string | null | undefined;
}

const ApiImage: React.FC<ApiImageProps> = ({ urlPath, style, ...props }) => {
    const [useBackup, setUseBackup] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    // Xây dựng URI ảnh, sẽ tự động cập nhật khi useBackup thay đổi
    const imageUri = useMemo(() => {
        if (!urlPath) return null;
        return buildImageUrl(urlPath, useBackup);
    }, [urlPath, useBackup]);

    // Nếu không có URI hoặc cả 2 link đều lỗi, dùng ảnh mặc định
    if (imageLoadFailed || !imageUri) {
        return (
            <Image
                source={require('../../assets/logo.png')} // Ảnh fallback cuối cùng
                style={style}
                {...props}
            />
        );
    }

    return (
        <Image
            source={{ uri: imageUri }}
            style={style}
            onError={() => {
                if (!useBackup) {
                    // Thử link backup nếu link chính lỗi
                    setUseBackup(true);
                } else {
                    // Cả 2 link đều lỗi
                    setImageLoadFailed(true);
                }
            }}
            {...props}
        />
    );
};

export default ApiImage;