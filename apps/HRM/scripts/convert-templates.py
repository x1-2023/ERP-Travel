#!/usr/bin/env python3
"""
SUBTASK-006b: Convert RTR MERGEFIELD templates to docxtemplater {placeholder} syntax.

Usage: python3 scripts/convert-templates.py

Reads from /tmp/rtr-templates/, outputs to public/templates/
"""

import zipfile
import os
import re
import shutil

# Source → Target mapping
TEMPLATE_MAP = {
    "Mẫu HĐ Thử việc.docx":                                        "hop-dong-thu-viec.docx",
    "Mẫu HĐ Chính thức.docx":                                       "hop-dong-chinh-thuc.docx",
    "Thỏa thuận thực tập sinh.docx":                                  "thoa-thuan-thuc-tap.docx",
    "Thỏa thuận bảo mật thông tin (ký cho tất cả nhân viên).docx":   "thoa-thuan-bao-mat.docx",
    "BM01. Don xin nghi viec.docx":                                   "don-xin-nghi-viec.docx",
    "Biên bản bàn giao Nghỉ việc - Merge.docx":                      "bien-ban-ban-giao.docx",
}

# MERGEFIELD name → docxtemplater tag
FIELD_MAP = {
    # Employee info
    "HỌ_VÀ_TÊN":           "ho_va_ten",
    "NĂM_SINH":             "nam_sinh",
    "CĂN_CƯỚCCCCD":         "cccd",
    "CMNDCCCD":              "cccd",
    "NGÀY_CẤP":             "ngay_cap",
    "NƠI_CẤP_":             "noi_cap",
    "ĐỊA_CHỈ_THƯỜNG_TRÚ":  "dia_chi_thuong_tru",
    "ĐỊA_CHỈ_HIỆN_TẠI":    "dia_chi_hien_tai",
    "ĐIỆN_THOẠI":           "dien_thoai",
    "Email_cá_nhân_":       "email_ca_nhan",
    "MÃ_NHÂN_VIÊN":         "ma_nhan_vien",

    # Contract info
    "SỐ_HĐ_THỬ_VIỆCTTTTS":            "so_hd_thu_viec",
    "SỐ_HĐ_CHÍNH_THỨC":               "so_hd_chinh_thuc",
    "Ngày_ký__HĐTVHĐTTS_Từ_ngày":     "ngay_ky_hd_thu_viec",
    "Ngày_ký__HĐ_CHÍNH_THỨC":         "ngay_ky_hd_chinh_thuc",
    "M___Đến_ngày":                     "den_ngay",
    "Đến_ngày":                         "den_ngay",
    "HẠN_HĐLOẠI_HĐ":                  "han_hop_dong",
    "HIỆU_QUẢ_CÔNG_VIỆC":             "hieu_qua_cong_viec",
    "TIỀN_XĂNG_XE":                    "tien_xang_xe",
}

SRC_DIR = "/tmp/rtr-templates"
DST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "templates")


def replace_mergefields_in_xml(xml_content: str) -> str:
    """
    Word MERGEFIELD XML looks like:
    <w:fldSimple w:instr=" MERGEFIELD FIELD_NAME \\* MERGEFORMAT">
      <w:r><w:t>«FIELD_NAME»</w:t></w:r>
    </w:fldSimple>

    Or complex field codes:
    <w:r><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:instrText> MERGEFIELD FIELD_NAME </w:instrText></w:r>
    <w:r><w:fldChar w:fldCharType="separate"/></w:r>
    <w:r><w:t>«FIELD_NAME»</w:t></w:r>
    <w:r><w:fldChar w:fldCharType="end"/></w:r>

    Strategy:
    1. Replace <w:fldSimple> blocks with {tag}
    2. Replace complex field code blocks with {tag}
    3. Replace remaining «FIELD_NAME» with {tag}
    """
    result = xml_content

    # 1. Handle <w:fldSimple> with MERGEFIELD
    def replace_fldsimple(match):
        instr = match.group(1)
        field_match = re.search(r'MERGEFIELD\s+(\S+)', instr)
        if field_match:
            field_name = field_match.group(1).rstrip('\\')
            tag = FIELD_MAP.get(field_name, field_name.lower())
            # Preserve the run properties from inside if any, but replace content
            return f'<w:r><w:t>{{{tag}}}</w:t></w:r>'
        return match.group(0)

    result = re.sub(
        r'<w:fldSimple\s+w:instr="([^"]*)"[^>]*>.*?</w:fldSimple>',
        replace_fldsimple,
        result,
        flags=re.DOTALL
    )

    # 2. Handle complex field codes (begin...separate...end)
    # This is harder - we need to find the begin/instrText/separate/end pattern
    def replace_complex_field(match):
        full = match.group(0)
        field_match = re.search(r'MERGEFIELD\s+(\S+)', full)
        if field_match:
            field_name = field_match.group(1).rstrip('\\')
            tag = FIELD_MAP.get(field_name, field_name.lower())
            return f'<w:r><w:t>{{{tag}}}</w:t></w:r>'
        return full

    # Match from fldChar begin to fldChar end
    # The pattern in real Word docs is:
    # <w:r ...><w:rPr>...</w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    # <w:r ...><w:rPr>...</w:rPr><w:instrText ...> MERGEFIELD NAME </w:instrText></w:r>
    # <w:r ...><w:rPr>...</w:rPr><w:fldChar w:fldCharType="separate"/></w:r>
    # <w:r ...><w:rPr>...</w:rPr><w:t>display text</w:t></w:r>
    # <w:r ...><w:rPr>...</w:rPr><w:fldChar w:fldCharType="end"/></w:r>
    result = re.sub(
        r'<w:r\b[^>]*>.*?<w:fldChar\s+w:fldCharType="begin"\s*/>\s*</w:r>'
        r'(.*?)'
        r'<w:r\b[^>]*>.*?<w:fldChar\s+w:fldCharType="end"\s*/>\s*</w:r>',
        replace_complex_field,
        result,
        flags=re.DOTALL
    )

    # 3. Replace remaining guillemet fields «FIELD_NAME»
    def replace_guillemet(match):
        field_name = match.group(1)
        tag = FIELD_MAP.get(field_name, field_name.lower())
        return f'{{{tag}}}'

    result = re.sub(r'«([^»]+)»', replace_guillemet, result)

    return result


def convert_template(src_path: str, dst_path: str):
    """Convert a single template file."""
    with zipfile.ZipFile(src_path, 'r') as zin:
        with zipfile.ZipFile(dst_path, 'w', zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == 'word/document.xml':
                    xml_content = data.decode('utf-8')
                    xml_content = replace_mergefields_in_xml(xml_content)
                    data = xml_content.encode('utf-8')
                # Also check headers/footers
                elif item.filename.startswith('word/header') or item.filename.startswith('word/footer'):
                    xml_content = data.decode('utf-8')
                    xml_content = replace_mergefields_in_xml(xml_content)
                    data = xml_content.encode('utf-8')
                zout.writestr(item, data)


def main():
    os.makedirs(DST_DIR, exist_ok=True)
    converted = 0

    for src_name, dst_name in TEMPLATE_MAP.items():
        src_path = os.path.join(SRC_DIR, src_name)
        dst_path = os.path.join(DST_DIR, dst_name)

        if not os.path.exists(src_path):
            print(f"  SKIP: {src_name} (not found)")
            continue

        convert_template(src_path, dst_path)
        converted += 1

        # Verify: check that {tags} exist in the output
        with zipfile.ZipFile(dst_path, 'r') as z:
            with z.open('word/document.xml') as f:
                content = f.read().decode('utf-8')
                tags = re.findall(r'\{([a-z_]+)\}', content)
                mergefields = re.findall(r'MERGEFIELD', content)
                print(f"  OK: {src_name} → {dst_name}")
                print(f"      Tags: {set(tags) if tags else 'none'}")
                if mergefields:
                    print(f"      WARNING: {len(mergefields)} MERGEFIELD(s) remaining")

    print(f"\nConverted {converted}/{len(TEMPLATE_MAP)} templates to {DST_DIR}")


if __name__ == "__main__":
    main()
