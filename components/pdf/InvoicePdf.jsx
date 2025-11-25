// components/pdf/InvoicePdf.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
  },
  summaryBox: {
    padding: 12,
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    marginTop: 10,
  },
});

export default function InvoicePdf({ invoice }) {
  const balance = invoice.amountDue - invoice.amountPaid;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice #{invoice.reference}</Text>
          <Text>Nyumba Real Estate</Text>
          <Text>Generated on {new Date().toDateString()}</Text>
        </View>

        {/* Tenant / Property Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Bill To:</Text>
          <Text>{invoice.tenant.fullName}</Text>
          {invoice.tenant.email && <Text>{invoice.tenant.email}</Text>}
          {invoice.tenant.phone && <Text>{invoice.tenant.phone}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Property:</Text>
          <Text>{invoice.property.title}</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Period:</Text>
            <Text>{invoice.periodLabel}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text>{new Date(invoice.issueDate).toDateString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text>{new Date(invoice.dueDate).toDateString()}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Due:</Text>
            <Text>ZMW {invoice.amountDue.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid:</Text>
            <Text>ZMW {invoice.amountPaid.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Outstanding:</Text>
            <Text>ZMW {balance.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={{ textTransform: "capitalize" }}>
              {invoice.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>
            Please make payment at your earliest convenience. Contact the
            landlord or property manager if you have questions.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
