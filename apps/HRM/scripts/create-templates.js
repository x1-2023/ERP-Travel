// Script to create placeholder .docx templates for document generation
// Run: node scripts/create-templates.js

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "public", "templates");

// Minimal .docx structure (word/document.xml)
function createMinimalDocx(bodyXml) {
  const zip = new PizZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/_rels/document.xml.rels
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
  );

  // word/document.xml
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:mv="urn:schemas-microsoft-com:mac:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
            xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
}

function p(text, bold = false) {
  const boldXml = bold
    ? "<w:rPr><w:b/><w:bCs/></w:rPr>"
    : "";
  return `<w:p><w:r>${boldXml}<w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
}

function br() {
  return `<w:p/>`;
}

// Template 1: HĐ Thử Việc
const probationBody = [
  p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true),
  p("Độc lập – Tự do – Hạnh phúc", true),
  br(),
  p("HỢP ĐỒNG THỬ VIỆC", true),
  p("Số: {so_hd_thu_viec}"),
  br(),
  p("Hôm nay, ngày {ngay_hom_nay}"),
  p("Tại: {cong_ty_dc}"),
  br(),
  p("BÊN A (NGƯỜI SỬ DỤNG LAO ĐỘNG):", true),
  p("Công ty: {cong_ty_ten}"),
  p("Mã số thuế: {cong_ty_mst}"),
  p("Địa chỉ: {cong_ty_dc}"),
  p("Đại diện: {giam_doc}"),
  br(),
  p("BÊN B (NGƯỜI LAO ĐỘNG):", true),
  p("Họ và tên: {ho_va_ten}"),
  p("Ngày sinh: {nam_sinh}"),
  p("CCCD: {cccd}   Ngày cấp: {ngay_cap}   Nơi cấp: {noi_cap}"),
  p("Địa chỉ thường trú: {dia_chi_thuong_tru}"),
  p("Địa chỉ hiện tại: {dia_chi_hien_tai}"),
  p("Điện thoại: {dien_thoai}"),
  p("Email: {email_ca_nhan}"),
  br(),
  p("Hai bên thỏa thuận ký kết hợp đồng thử việc với các điều khoản sau:"),
  br(),
  p("Điều 1. Công việc và thời hạn:", true),
  p("Chức vụ: {chuc_vu}"),
  p("Mã nhân viên: {ma_nhan_vien}"),
  p("Thời hạn thử việc: Từ ngày {ngay_ky_hd_thu_viec} đến ngày {den_ngay}"),
  br(),
  p("Điều 2. Lương thử việc: Theo thỏa thuận hai bên."),
  br(),
  p("ĐẠI DIỆN BÊN A                    BÊN B"),
  p("{giam_doc}                    {ho_va_ten}"),
].join("\n");

// Template 2: HĐ Chính Thức
const officialBody = [
  p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true),
  p("Độc lập – Tự do – Hạnh phúc", true),
  br(),
  p("HỢP ĐỒNG LAO ĐỘNG", true),
  p("Số: {so_hd_chinh_thuc}"),
  br(),
  p("Hôm nay, ngày {ngay_hom_nay}"),
  p("Tại: {cong_ty_dc}"),
  br(),
  p("BÊN A (NGƯỜI SỬ DỤNG LAO ĐỘNG):", true),
  p("Công ty: {cong_ty_ten}"),
  p("Mã số thuế: {cong_ty_mst}"),
  p("Địa chỉ: {cong_ty_dc}"),
  p("Đại diện: {giam_doc}"),
  br(),
  p("BÊN B (NGƯỜI LAO ĐỘNG):", true),
  p("Họ và tên: {ho_va_ten}"),
  p("Ngày sinh: {ngay_thang_nam_sinh}"),
  p("CCCD: {cccd}   Ngày cấp: {ngay_cap}   Nơi cấp: {noi_cap}"),
  p("Địa chỉ thường trú: {dia_chi_thuong_tru}"),
  p("Địa chỉ hiện tại: {dia_chi_hien_tai}"),
  p("Điện thoại: {dien_thoai}"),
  p("Email: {email_ca_nhan}"),
  br(),
  p("Hai bên thỏa thuận ký kết hợp đồng lao động với các điều khoản sau:"),
  br(),
  p("Điều 1. Công việc và thời hạn:", true),
  p("Chức vụ: {chuc_vu}"),
  p("Mã nhân viên: {ma_nhan_vien}"),
  p("Ngày vào làm: {ngay_vao}"),
  p("Loại hợp đồng: {han_hop_dong}"),
  p("Thời hạn: Từ ngày {ngay_ky_hd_chinh_thuc} đến ngày {den_ngay}"),
  br(),
  p("Điều 2. Chế độ lương và phúc lợi: Theo quy chế công ty."),
  br(),
  p("ĐẠI DIỆN BÊN A                    BÊN B"),
  p("{giam_doc}                    {ho_va_ten}"),
].join("\n");

// Template 3: Thỏa thuận thực tập sinh
const internBody = [
  p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true),
  p("Độc lập – Tự do – Hạnh phúc", true),
  br(),
  p("THỎA THUẬN THỰC TẬP SINH", true),
  p("Số: {so_hd_chinh_thuc}"),
  br(),
  p("Công ty: {cong_ty_ten}"),
  p("Thực tập sinh: {ho_va_ten}"),
  p("CCCD: {cccd}   Ngày cấp: {ngay_cap}"),
  p("Chức vụ: {chuc_vu}"),
  p("Thời gian: Từ {ngay_ky_hd_chinh_thuc} đến {den_ngay}"),
  br(),
  p("ĐẠI DIỆN CÔNG TY                  THỰC TẬP SINH"),
  p("{giam_doc}                    {ho_va_ten}"),
].join("\n");

// Template 4: NDA
const ndaBody = [
  p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true),
  p("Độc lập – Tự do – Hạnh phúc", true),
  br(),
  p("THỎA THUẬN BẢO MẬT THÔNG TIN", true),
  br(),
  p("Bên A: {cong_ty_ten}"),
  p("Đại diện: {giam_doc}"),
  p("Địa chỉ: {cong_ty_dc}"),
  br(),
  p("Bên B:"),
  p("Họ tên: {ho_va_ten}"),
  p("Mã NV: {ma_nhan_vien}"),
  p("CCCD: {cccd}"),
  p("Chức vụ: {chuc_vu}"),
  br(),
  p("Hai bên đồng ý thỏa thuận bảo mật thông tin và không cạnh tranh theo các điều khoản sau:"),
  p("1. Bên B cam kết bảo mật mọi thông tin kinh doanh, kỹ thuật, tài chính của Bên A."),
  p("2. Thời hạn bảo mật: trong suốt thời gian làm việc và 2 năm sau khi nghỉ việc."),
  br(),
  p("Ngày ký: {ngay_hom_nay}"),
  br(),
  p("ĐẠI DIỆN BÊN A                    BÊN B"),
  p("{giam_doc}                    {ho_va_ten}"),
].join("\n");

// Template 5: Đơn xin nghỉ việc
const resignBody = [
  p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true),
  p("Độc lập – Tự do – Hạnh phúc", true),
  br(),
  p("ĐƠN XIN NGHỈ VIỆC", true),
  br(),
  p("Kính gửi: Ban Giám Đốc {cong_ty_ten}"),
  br(),
  p("Tôi tên: {ho_va_ten}"),
  p("Mã nhân viên: {ma_nhan_vien}"),
  p("Chức vụ: {chuc_vu}"),
  p("Ngày vào làm: {ngay_vao}"),
  br(),
  p("Tôi viết đơn này kính đề nghị Ban Giám Đốc cho phép tôi được nghỉ việc."),
  p("Lý do: ..............................................................."),
  br(),
  p("Tôi cam kết sẽ bàn giao đầy đủ công việc trước khi nghỉ."),
  br(),
  p("Ngày: {ngay_hom_nay}"),
  p("Người viết đơn: {ho_va_ten}"),
].join("\n");

// Template 6: Biên bản bàn giao nghỉ việc
const handoverBody = [
  p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true),
  p("Độc lập – Tự do – Hạnh phúc", true),
  br(),
  p("BIÊN BẢN BÀN GIAO NGHỈ VIỆC", true),
  br(),
  p("Công ty: {cong_ty_ten}"),
  br(),
  p("Nhân viên nghỉ việc:"),
  p("Họ tên: {ho_va_ten}"),
  p("Mã NV: {ma_nhan_vien}"),
  p("Chức vụ: {chuc_vu}"),
  p("Ngày vào: {ngay_vao}"),
  br(),
  p("Nội dung bàn giao:"),
  p("1. Tài liệu: ......"),
  p("2. Thiết bị: ......"),
  p("3. Công việc: ......"),
  br(),
  p("Ngày: {ngay_hom_nay}"),
  p("NGƯỜI BÀN GIAO          NGƯỜI NHẬN          XÁC NHẬN HR"),
  p("{ho_va_ten}"),
].join("\n");

const templates = [
  { file: "hop-dong-thu-viec.docx", body: probationBody },
  { file: "hop-dong-chinh-thuc.docx", body: officialBody },
  { file: "thoa-thuan-thuc-tap.docx", body: internBody },
  { file: "thoa-thuan-bao-mat.docx", body: ndaBody },
  { file: "don-xin-nghi-viec.docx", body: resignBody },
  { file: "bien-ban-ban-giao.docx", body: handoverBody },
];

for (const tmpl of templates) {
  const buf = createMinimalDocx(tmpl.body);
  const outPath = path.join(TEMPLATES_DIR, tmpl.file);
  fs.writeFileSync(outPath, buf);
  console.log(`Created: ${outPath}`);
}

// Verify templates work with docxtemplater
console.log("\nVerifying templates with docxtemplater...");
for (const tmpl of templates) {
  try {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, tmpl.file), "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render({
      ho_va_ten: "Nguyễn Văn A",
      cccd: "012345678901",
      ngay_hom_nay: "04/03/2026",
    });
    doc.getZip().generate({ type: "nodebuffer" });
    console.log(`✓ ${tmpl.file} — OK`);
  } catch (e) {
    console.error(`✗ ${tmpl.file} — ERROR:`, e.message);
  }
}
