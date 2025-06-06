package com.example.shuttlesync.util;

import com.example.shuttlesync.dto.InvoiceDTO;
import com.example.shuttlesync.dto.InvoiceDetailDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

public class PDFGenerator {

    // Đường dẫn đến font tiếng Việt
    private static final String FONT_PATH = "src/main/resources/fonts/vietnamese/BeVietnamPro-Regular.ttf";
    private static final String FONT_BOLD_PATH = "src/main/resources/fonts/vietnamese/BeVietnamPro-Bold.ttf";
    
    // Khai báo font với Unicode tiếng Việt
    private static Font TITLE_FONT;
    private static Font HEADER_FONT;
    private static Font NORMAL_FONT;
    private static Font BOLD_FONT;
    private static Font SMALL_FONT;
    
    // Khởi tạo các font
    static {
        try {
            BaseFont baseFont = BaseFont.createFont(FONT_PATH, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            BaseFont boldBaseFont = BaseFont.createFont(FONT_BOLD_PATH, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            
            TITLE_FONT = new Font(boldBaseFont, 18, Font.NORMAL);
            HEADER_FONT = new Font(boldBaseFont, 12, Font.NORMAL);
            NORMAL_FONT = new Font(baseFont, 10, Font.NORMAL);
            BOLD_FONT = new Font(boldBaseFont, 10, Font.NORMAL);
            SMALL_FONT = new Font(baseFont, 8, Font.NORMAL);
        } catch (DocumentException | IOException e) {
            // Fallback to standard fonts if custom font fails to load
            TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
            BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
            SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL);
            e.printStackTrace();
        }
    }
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    
    public static byte[] generateInvoicePDF(InvoiceDTO invoice) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        
        document.open();
        
        // Add title
        Paragraph title = new Paragraph("HÓA ĐƠN", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        // Add invoice number
        Paragraph invoiceNumber = new Paragraph("Số hóa đơn: #" + invoice.getId(), HEADER_FONT);
        invoiceNumber.setAlignment(Element.ALIGN_CENTER);
        document.add(invoiceNumber);
        
        document.add(Chunk.NEWLINE);
        
        // Add invoice information
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        
        // Left side - Customer info
        PdfPCell customerCell = new PdfPCell();
        customerCell.setBorder(Rectangle.NO_BORDER);
        customerCell.addElement(new Paragraph("THÔNG TIN KHÁCH HÀNG", HEADER_FONT));
        customerCell.addElement(new Paragraph("Tên: " + invoice.getCustomerName(), NORMAL_FONT));
        customerCell.addElement(new Paragraph("Email: " + invoice.getCustomerEmail(), NORMAL_FONT));
        customerCell.addElement(new Paragraph("Điện thoại: " + invoice.getCustomerPhone(), NORMAL_FONT));
        infoTable.addCell(customerCell);
        
        // Right side - Invoice info
        PdfPCell invoiceInfoCell = new PdfPCell();
        invoiceInfoCell.setBorder(Rectangle.NO_BORDER);
        invoiceInfoCell.addElement(new Paragraph("THÔNG TIN HÓA ĐƠN", HEADER_FONT));
        invoiceInfoCell.addElement(new Paragraph("Ngày: " + formatDate(invoice.getInvoiceDate()), NORMAL_FONT));
        invoiceInfoCell.addElement(new Paragraph("Trạng thái: " + invoice.getStatus(), NORMAL_FONT));
        invoiceInfoCell.addElement(new Paragraph("Booking ID: " + invoice.getBookingId(), NORMAL_FONT));
        infoTable.addCell(invoiceInfoCell);
        
        document.add(infoTable);
        
        document.add(Chunk.NEWLINE);
        
        // Add invoice details table
        document.add(new Paragraph("CHI TIẾT HÓA ĐƠN", HEADER_FONT));
        document.add(Chunk.NEWLINE);
        
        PdfPTable detailsTable = new PdfPTable(new float[] {5, 2, 1, 2, 2});
        detailsTable.setWidthPercentage(100);
        
        // Add table header
        detailsTable.addCell(createHeaderCell("Mục"));
        detailsTable.addCell(createHeaderCell("Ngày"));
        detailsTable.addCell(createHeaderCell("SL"));
        detailsTable.addCell(createHeaderCell("Đơn giá"));
        detailsTable.addCell(createHeaderCell("Thành tiền"));
        
        // Add table rows
        if (invoice.getDetails() != null) {
            for (InvoiceDetailDTO detail : invoice.getDetails()) {
                detailsTable.addCell(createCell(detail.getItemName() + (detail.getCourtName() != null ? "\n" + detail.getCourtName() : "")));
                detailsTable.addCell(createCell(formatDate(detail.getBookingDate())));
                detailsTable.addCell(createCell(String.valueOf(detail.getQuantity())));
                detailsTable.addCell(createCell(formatCurrency(detail.getUnitPrice())));
                detailsTable.addCell(createCell(formatCurrency(detail.getAmount())));
            }
        }
        
        document.add(detailsTable);
        
        document.add(Chunk.NEWLINE);
        
        // Add summary
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(50);
        summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        summaryTable.addCell(createSummaryCell("Tổng tiền gốc:"));
        summaryTable.addCell(createSummaryCellValue(formatCurrency(invoice.getOriginalAmount())));
        
        summaryTable.addCell(createSummaryCell("Giảm giá:"));
        summaryTable.addCell(createSummaryCellValue("-" + formatCurrency(invoice.getDiscountAmount())));
        
        PdfPCell totalLabelCell = createSummaryCell("Thành tiền:");
        totalLabelCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        summaryTable.addCell(totalLabelCell);
        
        PdfPCell totalValueCell = createSummaryCellValue(formatCurrency(invoice.getFinalAmount()));
        totalValueCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        summaryTable.addCell(totalValueCell);
        
        document.add(summaryTable);
        
        document.add(Chunk.NEWLINE);
        
        // Add notes
        if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
            document.add(new Paragraph("Ghi chú:", BOLD_FONT));
            document.add(new Paragraph(invoice.getNotes(), NORMAL_FONT));
        }
        
        document.add(Chunk.NEWLINE);
        
        // Add footer
        Paragraph footer = new Paragraph("Cảm ơn quý khách đã sử dụng dịch vụ của ShuttleSync!", SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
        
        document.close();
        
        return baos.toByteArray();
    }
    
    private static PdfPCell createHeaderCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BOLD_FONT));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setPadding(5);
        return cell;
    }
    
    private static PdfPCell createCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setPadding(5);
        return cell;
    }
    
    private static PdfPCell createSummaryCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BOLD_FONT));
        cell.setBorder(Rectangle.TOP | Rectangle.LEFT | Rectangle.BOTTOM);
        cell.setPadding(5);
        return cell;
    }
    
    private static PdfPCell createSummaryCellValue(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BOLD_FONT));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.TOP | Rectangle.RIGHT | Rectangle.BOTTOM);
        cell.setPadding(5);
        return cell;
    }
    
    private static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "";
    }
    
    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : "";
    }
    
    private static String formatCurrency(Number amount) {
        return amount != null ? CURRENCY_FORMATTER.format(amount) : "0 ₫";
    }
} 