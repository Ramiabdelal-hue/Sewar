-- AlterTable: تغيير imageUrl إلى imageUrls
-- إذا كان العمود imageUrl موجود، نحذفه ونضيف imageUrls
DO $$ 
BEGIN
    -- حذف العمود القديم إذا كان موجود
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Question' 
        AND column_name = 'imageUrl'
    ) THEN
        ALTER TABLE "Question" DROP COLUMN "imageUrl";
    END IF;

    -- إضافة العمود الجديد إذا لم يكن موجود
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Question' 
        AND column_name = 'imageUrls'
    ) THEN
        ALTER TABLE "Question" ADD COLUMN "imageUrls" TEXT[];
    END IF;
END $$;
