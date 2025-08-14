import { createNavigationContainerRef } from '@react-navigation/native';

// Tạo một tham chiếu (ref) đến NavigationContainer
export const navigationRef = createNavigationContainerRef();

/**
 * Hàm navigate cho phép bạn điều hướng đến một màn hình cụ thể.
 * @param {string} name - Tên của màn hình muốn đến.
 * @param {object} params - Các tham số muốn truyền cho màn hình đó.
 */
export function navigate(name, params) {
    // Kiểm tra xem navigator đã sẵn sàng chưa
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        // Bạn có thể xử lý trường hợp navigator chưa sẵn sàng ở đây
        // Ví dụ: lưu lại và thử lại sau, hoặc ghi log
        console.warn("Navigation not ready yet, call queued.");
    }
}