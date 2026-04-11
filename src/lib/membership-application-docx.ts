import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeightRule,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
  convertInchesToTwip,
} from "docx";

const PAGE_MARGIN = {
  top: 720,
  right: 720,
  bottom: 720,
  left: 720,
};

const BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "000000",
};

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: "FFFFFF",
};

export async function generateBlankMembershipApplicationDocx(): Promise<Blob> {
  const headerImage = await loadHeaderImage();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGIN,
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new ImageRun({
                    data: headerImage,
                    transformation: {
                      width: 520,
                      height: 104,
                    },
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Blank hard-copy membership application form",
                    italics: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: buildDocumentBody(),
      },
    ],
  });

  return Packer.toBlob(doc);
}

async function loadHeaderImage() {
  const response = await fetch("/print-templates/membership-application-header.png");
  if (!response.ok) {
    throw new Error("Failed to load membership application header.");
  }
  return new Uint8Array(await response.arrayBuffer());
}

function buildDocumentBody() {
  return [
    centeredTitle("MEMBERSHIP APPLICATION FORM"),
    helperCopy(
      "This blank form is intended for hard-copy fill-out. Please write legibly and complete all applicable fields.",
    ),
    sectionTitle("I. CONTACT INFORMATION"),
    lineTable([
      ["First Name", "Middle Initial", "Last Name", "Ext."],
      ["Email Address", "Mobile / Phone Number"],
      ["Nationality", "Date of Birth", "Age"],
      ["Emergency Contact Name", "Emergency Contact Mobile"],
    ]),
    choiceParagraph(
      "Civil Status",
      ["Single", "Married", "Widowed", "Separated"],
      "checkbox",
    ),
    choiceParagraph("Gender", ["Male", "Female"], "radio"),
    wideLine("House No., Street, Subdivision / Village"),
    wideLine("Barangay / Municipality / City / Province / Region"),
    sectionTitle("II. CHURCH BACKGROUND"),
    lineTable([
      ["Church / Organization Affiliation"],
      ["Church Address"],
      ["If Others, Please Specify"],
      ["Height", "Weight", "Blood Type"],
      ["Color of Eyes", "Color of Skin", "SSS Number"],
      ["TIN Number", "Skills / Talents"],
    ]),
    choiceParagraph(
      "Member Type",
      [
        "Associate Chaplain",
        "Professional Chaplain",
        "Ordained and Commissioned Practitioner",
        "Certified Specialist Training Officer/Instructor",
      ],
      "radio",
    ),
    choiceParagraph(
      "Current Position / Role",
      ["Church Worker", "Pastor", "Rev.", "Bishop", "Others"],
      "radio",
    ),
    choiceParagraph(
      "Preferred Branch/es of Service",
      [
        "Humanitarian",
        "Hospital and Care",
        "Military/PNP",
        "School",
        "Corporate",
        "Disaster & Rescue Operations",
        "Prison",
        "Security",
        "Government",
        "DSWD",
        "Others",
      ],
      "checkbox",
    ),
    wideLine("If Others, Please Specify"),
    sectionTitle("III. EDUCATION AND MINISTRY"),
    wideLine("Elementary (Name of School / Course / Year Graduated)"),
    wideLine("Secondary (Name of School / Course / Year Graduated)"),
    wideLine("Tertiary / College (Name of School / Course / Year Graduated)"),
    wideLine("Tertiary / College (Additional Entry)"),
    wideLine("Post-graduate Studies (Name of School / Course / Year Graduated)"),
    wideLine("Post-graduate Studies (Additional Entry)"),
    miniHeading("Ministerial / Work Experience"),
    borderedTable(
      ["Role / Position", "Institution", "Years"],
      4,
      [42, 42, 16],
    ),
    new Paragraph({ children: [new PageBreak()] }),
    sectionTitle("IV. REFERENCES AND CONFIRMATION"),
    miniHeading("Character References"),
    borderedTable(
      ["Name", "Position / Relationship", "Contact Number"],
      3,
      [34, 46, 20],
    ),
    choiceParagraph(
      "Declaration of Truth",
      [
        "I hereby certify that the statements made in this application are true and correct.",
      ],
      "checkbox",
    ),
    choiceParagraph(
      "Membership Pledge",
      [
        "I understand and agree to the responsibilities and commitments of membership.",
      ],
      "checkbox",
    ),
    signatureTable(),
  ];
}

function centeredTitle(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
      }),
    ],
  });
}

function helperCopy(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 180 },
    children: [
      new TextRun({
        text,
        italics: true,
        size: 18,
      }),
    ],
  });
}

function sectionTitle(text: string) {
  return new Paragraph({
    spacing: { before: 120, after: 100 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 2,
        color: "000000",
      },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
      }),
    ],
  });
}

function miniHeading(text: string) {
  return new Paragraph({
    spacing: { before: 100, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 20,
      }),
    ],
  });
}

function lineTable(rows: string[][]) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    layout: TableLayoutType.FIXED,
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: rows.map((row) =>
      new TableRow({
        children: row.map((label) =>
          new TableCell({
            width: {
              size: Math.floor(100 / row.length),
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
              bottom: BORDER,
            },
            margins: {
              top: 80,
              left: 80,
              right: 80,
              bottom: 120,
            },
            children: [
              new Paragraph({
                spacing: { after: 140 },
                children: [
                  new TextRun({
                    text: label,
                    size: 18,
                  }),
                ],
              }),
              new Paragraph({
                children: [blankUnderline(26)],
              }),
            ],
          }),
        ),
      }),
    ),
  });
}

function wideLine(label: string) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    layout: TableLayoutType.FIXED,
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
              bottom: BORDER,
            },
            margins: {
              top: 80,
              left: 80,
              right: 80,
              bottom: 120,
            },
            children: [
              new Paragraph({
                spacing: { after: 140 },
                children: [
                  new TextRun({
                    text: label,
                    size: 18,
                  }),
                ],
              }),
              new Paragraph({
                children: [blankUnderline(72)],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function choiceParagraph(
  label: string,
  options: string[],
  type: "radio" | "checkbox",
) {
  const marker = type === "radio" ? "○" : "☐";

  return new Paragraph({
    spacing: { before: 100, after: 100 },
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 18,
      }),
      ...options.flatMap((option, index) => [
        new TextRun({
          text: `${marker} ${option}`,
          size: 18,
        }),
        new TextRun({
          text: index === options.length - 1 ? "" : "    ",
          size: 18,
        }),
      ]),
    ],
  });
}

function borderedTable(headers: string[], rowCount: number, columnWidths: number[]) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header, index) =>
          new TableCell({
            width: {
              size: columnWidths[index],
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: BORDER,
              bottom: BORDER,
              left: BORDER,
              right: BORDER,
            },
            margins: { top: 80, bottom: 80, left: 80, right: 80 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: header,
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ),
      }),
      ...Array.from({ length: rowCount }, () =>
        new TableRow({
          children: headers.map((_, index) =>
            new TableCell({
              width: {
                size: columnWidths[index],
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: BORDER,
                bottom: BORDER,
                left: BORDER,
                right: BORDER,
              },
              height: {
                value: 520,
                rule: HeightRule.ATLEAST,
              },
              margins: { top: 80, bottom: 80, left: 80, right: 80 },
              children: [new Paragraph({ children: [new TextRun("")] })],
            }),
          ),
        }),
      ),
    ],
  });
}

function signatureTable() {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    layout: TableLayoutType.FIXED,
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 62,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: NO_BORDER,
              bottom: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Applicant's Signature",
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        height: {
                          value: convertInchesToTwip(1.4),
                          rule: HeightRule.EXACT,
                        },
                        borders: {
                          top: BORDER,
                          bottom: BORDER,
                          left: BORDER,
                          right: BORDER,
                        },
                        children: [new Paragraph("")],
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 60 },
                children: [blankUnderline(28)],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Signature over printed name",
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: {
              size: 38,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: NO_BORDER,
              bottom: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Date Signed",
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 240 },
                children: [blankUnderline(18)],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Printed Name",
                    bold: true,
                    size: 18,
                  }),
                ],
              }),
              new Paragraph({
                children: [blankUnderline(18)],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function blankUnderline(length: number) {
  return new TextRun({
    text: "_".repeat(length),
    underline: {
      type: UnderlineType.SINGLE,
      color: "000000",
    },
    size: 18,
  });
}
