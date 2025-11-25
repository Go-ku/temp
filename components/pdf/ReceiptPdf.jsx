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
  box: {
    padding: 12,
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    marginTop: 10,
  },
});

export default function ReceiptPdf({ payment }) {
  const amount = payment.amount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Receipt</Text>
          <Text>Nyumba Real Estate</Text>
          <Text>Generated on {new Date().toDateString()}</Text>
        </View>

        {/* Tenant info */}
        <View style={styles.section}>
          <Text style={styles.label}>Received From:</Text>
          <Text>{payment.tenant?.fullName}</Text>
          {payment.tenant?.email && <Text>{payment.tenant.email}</Text>}
          {payment.tenant?.phone && <Text>{payment.tenant.phone}</Text>}
        </View>

        {/* Property */}
        <View style={styles.section}>
          <Text style={styles.label}>Property:</Text>
          <Text>{payment.property?.title}</Text>
        </View>

        {/* Payment details */}
        <View style={styles.box}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt No:</Text>
            <Text>{payment.receiptNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Paid Amount:</Text>
            <Text>ZMW {amount.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={{ textTransform: "capitalize" }}>
              {payment.method.replace("_", " ")}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date Paid:</Text>
            <Text>{new Date(payment.datePaid).toDateString()}</Text>
          </View>

          {payment.transactionId && (
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text>{payment.transactionId}</Text>
            </View>
          )}

          {payment.invoice && (
            <View style={styles.row}>
              <Text style={styles.label}>Invoice:</Text>
              <Text>{payment.invoice.reference}</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>This is an official receipt for the above payment.</Text>
        </View>
      </Page>
    </Document>
  );
}
