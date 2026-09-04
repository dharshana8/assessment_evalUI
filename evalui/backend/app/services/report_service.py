import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ReportService:
    @staticmethod
    def generate_evaluation_pdf(eval_data: Dict[str, Any]) -> bytes:
        """
        Generate a professional evaluation report PDF using ReportLab.
        Returns PDF byte contents.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1e293b"),
            fontName="Helvetica-Bold",
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748b"),
            fontName="Helvetica",
            spaceAfter=12
        )

        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold",
            spaceBefore=12,
            spaceAfter=8
        )

        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155")
        )

        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontSize=9,
            leading=11,
            textColor=colors.white,
            fontName="Helvetica-Bold"
        )

        table_cell_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1e293b")
        )

        story = []

        # Title block
        story.append(Paragraph("EvalUI Evaluation Report", title_style))
        story.append(Paragraph("Explainable AI-Assisted Descriptive Answer Evaluation", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=15))

        # Assignment Metadata Box
        meta_data = [
            [
                Paragraph("<b>Assignment:</b> " + str(eval_data.get("assignment_title", "N/A")), body_style),
                Paragraph("<b>Date:</b> " + datetime.now().strftime("%Y-%m-%d %H:%M"), body_style)
            ],
            [
                Paragraph("<b>Question:</b> " + str(eval_data.get("question", "N/A")), body_style),
                Paragraph("<b>Student ID:</b> " + str(eval_data.get("student_id", "N/A")), body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[360, 180])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0"))
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 15))

        # Score Summary Card
        total_score = eval_data.get("total_score", 0.0)
        final_score = eval_data.get("final_score", total_score)
        max_score = eval_data.get("max_score", 1.0)
        percentage = round((final_score / max_score * 100.0), 1) if max_score > 0 else 0.0

        is_overridden = abs(final_score - total_score) > 0.001

        score_text = f"<b>Final Score:</b> {final_score} / {max_score} ({percentage}%)"
        if is_overridden:
            score_text += f" <font color='#d97706'>[AI Score: {total_score} - Teacher Override Applied]</font>"

        score_table = Table([[
            Paragraph(score_text, ParagraphStyle('ScoreBanner', parent=body_style, fontSize=12, leading=16, textColor=colors.HexColor("#0f172a")))
        ]], colWidths=[540])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
            ('PADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#3b82f6"))
        ]))
        story.append(score_table)
        story.append(Spacer(1, 15))

        # Student Answer Section
        story.append(Paragraph("Student Answer", heading_style))
        student_ans_text = eval_data.get("student_answer", "")
        story.append(Table([[Paragraph(student_ans_text, body_style)]], colWidths=[540], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1"))
        ]))
        story.append(Spacer(1, 15))

        # Criterion Breakdown Table
        story.append(Paragraph("Criterion Evaluation Breakdown", heading_style))

        headers = [
            Paragraph("<b>Criterion</b>", table_header_style),
            Paragraph("<b>Max</b>", table_header_style),
            Paragraph("<b>AI / Final</b>", table_header_style),
            Paragraph("<b>Status</b>", table_header_style),
            Paragraph("<b>Evidence & Feedback</b>", table_header_style)
        ]

        table_rows = [headers]

        for crit in eval_data.get("criteria", []):
            desc = crit.get("description", "")
            max_m = crit.get("max_marks", 1.0)
            ai_m = crit.get("awarded_marks", 0.0)
            ov_m = crit.get("override_score")
            fin_m = ov_m if ov_m is not None else ai_m
            status = crit.get("status", "UNSUPPORTED")
            feedback = crit.get("feedback", "")
            ev = crit.get("evidence")

            ev_text = f"<i>Evidence: \"{ev['text']}\"</i><br/>" if ev else "<i>No direct evidence sentence found.</i><br/>"
            cell_desc = Paragraph(desc, table_cell_style)
            cell_max = Paragraph(str(max_m), table_cell_style)
            
            score_cell_str = f"{fin_m}"
            if ov_m is not None and abs(ov_m - ai_m) > 0.001:
                score_cell_str = f"<b>{ov_m}</b> (AI: {ai_m})"
            cell_score = Paragraph(score_cell_str, table_cell_style)

            # Color badge for status
            status_color = "#16a34a" if status == "ENTAILED" else ("#d97706" if status == "PARTIAL" else "#dc2626")
            cell_status = Paragraph(f"<font color='{status_color}'><b>{status}</b></font>", table_cell_style)

            cell_feedback = Paragraph(ev_text + feedback, table_cell_style)

            table_rows.append([cell_desc, cell_max, cell_score, cell_status, cell_feedback])

        crit_table = Table(table_rows, colWidths=[130, 35, 65, 75, 235])
        crit_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")])
        ]))

        story.append(crit_table)
        story.append(Spacer(1, 15))

        # Diagnostic Summary
        story.append(Paragraph("Diagnostic Summary", heading_style))
        diag_text = eval_data.get("diagnostic_summary", "Evaluation complete.")
        story.append(Paragraph(diag_text, body_style))

        # Footer
        story.append(Spacer(1, 20))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
        story.append(Paragraph("Generated by EvalUI — Offline Explainable Assessment System", ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=colors.HexColor("#94a3b8"), alignment=1)))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
