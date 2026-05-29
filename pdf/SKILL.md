---
name: pdf
description: Read, parse, and analyze PDF documents with page-range support and structured extraction
category: data/processing
tags: [pdf, document-processing, parsing, extraction, analysis]
source_path: data/processing/pdf
class: data
subclass: processing
---

# PDF

## Purpose

Read and analyze PDF documents of any size — extracting text, tables, and document structure, summarizing content, and searching within documents. Supports page-range selection for large files and integrates with development workflows.

## Prompt

Read and analyze a PDF document. Follow these guidelines:

1. **Accept flexible input.** Support file paths (absolute or relative) and handle PDFs of any size. When the user references a PDF, use the Read tool with the file path to access its contents.
2. **Use page-range selection for large documents.** For PDFs with more than 10 pages, always specify a page range (e.g., `pages: "1-5"`). Read a maximum of 20 pages per request. If the user needs the full document, process it in sequential page-range batches.
3. **Extract text content.** Parse and return the text content of the specified pages. Preserve paragraph structure and logical reading order as much as possible.
4. **Extract tables and structured data.** Identify tabular data within the PDF and present it in a structured format (markdown tables, CSV, or JSON as appropriate). Note when table extraction may be imprecise due to complex layouts.
5. **Summarize content.** When asked to summarize, provide a concise overview covering: document type, key topics, main findings or arguments, and important data points. Scale summary length to document length.
6. **Search within documents.** Support searching for specific terms, phrases, or patterns within the PDF. Report matching pages and surrounding context.
7. **Handle multi-page analysis.** When analyzing across multiple page ranges, maintain continuity — track section headings, running arguments, and cross-references across batches.
8. **Integrate with dev workflows.** When PDFs contain specs, RFCs, API documentation, or technical requirements, extract actionable items and translate them into development tasks, code structures, or test cases as requested.
9. **Report limitations clearly.** If pages are scanned images (not OCR'd text), if content is encrypted, or if layout parsing is unreliable, inform the user rather than returning garbled output.

## Examples

**Read first 5 pages of a PDF:**
```
Read pages 1-5 of /path/to/document.pdf and summarize the key points.
```

**Extract a specific table:**
```
Extract the pricing table from page 12 of the proposal.pdf file.
```

**Search within a document:**
```
Search for all mentions of "authentication" in the API spec PDF.
```

**Process a large document in batches:**
```
# First batch
Read pages 1-20 of /path/to/large-report.pdf
# Second batch
Read pages 21-40 of /path/to/large-report.pdf
# Synthesize across batches
```

**Extract requirements from a spec:**
```
Read the requirements section (pages 8-15) of spec.pdf and create GitHub issues for each requirement.
```
