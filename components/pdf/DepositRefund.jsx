import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  section: { marginBottom: 10 }
});

export function DepositRefundPdf({ lease, amount, reason }) {
  const tenant = lease.tenant;
  const property = lease.property;

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Deposit Refund Receipt</Text>
          <Text>Nyumba Real Estate</Text>
          <Text>Date: {new Date().toDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text>Tenant: {tenant.fullName}</Text>
          {tenant.email && <Text>Email: {tenant.email}</Text>}
        </View>

        <View style={styles.section}>
          <Text>Property: {property.title}</Text>
          <Text>Refund Amount: ZMW {amount}</Text>
          <Text>Reason: {reason}</Text>
        </View>
      </Page>
    </Document>
  );
}
