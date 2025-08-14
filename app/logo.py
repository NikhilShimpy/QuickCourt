from fpdf import FPDF

# Create a PDF with 3 variations of stamp markers
pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Common details
company_name = "WOLTERS KLUWER INDIA PVT. LTD."
website = "www.wolterskluwer.com"
phone = "+91-22-6649 1818"
pan = "AAACW6190J"
tan = "TAN - [Not Publicly Available]"
gstin = "27AAACW6190J2ZX (Pune, Maharashtra)"

stamp_text = f"""{company_name} | {website} | {phone}
PAN - {pan} | {tan}
GSTIN - {gstin}"""

# Variation 1 - Standard Box
pdf.add_page()
pdf.set_font("Arial", "B", 14)
pdf.set_line_width(0.5)
pdf.rect(10, 40, 190, 40)
pdf.set_xy(15, 50)
pdf.multi_cell(0, 8, stamp_text, 0, 'C')

# Variation 2 - Dashed Border
pdf.add_page()
pdf.set_font("Courier", "B", 14)
pdf.set_line_width(0.5)
# Draw dashed rectangle manually
x_start, y_start, width, height = 10, 40, 190, 40
dash_length = 5
# Top border
x = x_start
while x < x_start + width:
    pdf.line(x, y_start, min(x + dash_length, x_start + width), y_start)
    x += 2 * dash_length
# Bottom border
x = x_start
while x < x_start + width:
    pdf.line(x, y_start + height, min(x + dash_length, x_start + width), y_start + height)
    x += 2 * dash_length
# Left border
y = y_start
while y < y_start + height:
    pdf.line(x_start, y, x_start, min(y + dash_length, y_start + height))
    y += 2 * dash_length
# Right border
y = y_start
while y < y_start + height:
    pdf.line(x_start + width, y, x_start + width, min(y + dash_length, y_start + height))
    y += 2 * dash_length
pdf.set_xy(15, 50)
pdf.multi_cell(0, 8, stamp_text, 0, 'C')

# Variation 3 - Thick Border + Italics
pdf.add_page()
pdf.set_font("Arial", "BI", 14)
pdf.set_line_width(1.2)
pdf.rect(10, 40, 190, 40)
pdf.set_xy(15, 50)
pdf.multi_cell(0, 8, stamp_text, 0, 'C')

# Save PDF with variations
output_path_variations = r"C:\Users\HP\OneDrive\Desktop\StreetConnect\Wolters_Kluwer_Stamp_Markers_Variations.pdf"
pdf.output(output_path_variations)


output_path_variations
