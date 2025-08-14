import { getAllBadwords } from '../services/api.comment'; // Giả sử API comment ở đây

/**
 * Hàm này nhận một chuỗi văn bản và thay thế tất cả các từ cấm
 * tìm thấy bằng chuỗi '*****'.
 * @param text - Chuỗi văn bản cần kiểm tra.
 * @returns - Chuỗi văn bản đã được kiểm duyệt.
 */
export const censorText = async (text: string): Promise<string> => {
    try {
        // API getAllBadwords đã có cơ chế cache, nên gọi trực tiếp là an toàn
        const badwords: string[] = await getAllBadwords();

        if (!badwords || badwords.length === 0) {
            return text;
        }

        // Tạo một biểu thức chính quy (RegExp) từ danh sách từ cấm
        // 'i' -> không phân biệt hoa thường, 'g' -> tìm tất cả các výdụ
        const regex = new RegExp(badwords.join('|'), 'gi');

        return text.replace(regex, '*****');
    } catch (error) {
        console.error("Could not censor text, returning original text.", error);
        // Nếu có lỗi khi lấy danh sách từ cấm, trả về văn bản gốc
        return text;
    }
};