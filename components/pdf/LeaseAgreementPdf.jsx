import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 12 },
  heading: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  line: { marginBottom: 6 }
});

export default function LeaseAgreementPdf({ lease }) {
  const tenant = lease.tenant;
  const property = lease.property;
  const landlord = lease.landlord;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Residential Lease Agreement</Text>

        <View style={styles.section}>
          <Text>This Lease Agreement is made between:</Text>
        </View>

        {/* LANDLORD */}
        <View style={styles.section}>
          <Text style={styles.heading}>Landlord</Text>
          <Text>{landlord?.name}</Text>
          {landlord?.email && <Text>{landlord.email}</Text>}
          {landlord?.phone && <Text>{landlord.phone}</Text>}
        </View>

        {/* TENANT */}
        <View style={styles.section}>
          <Text style={styles.heading}>Tenant</Text>
          <Text>{tenant.fullName}</Text>
          {tenant.email && <Text>{tenant.email}</Text>}
          {tenant.phone && <Text>{tenant.phone}</Text>}
        </View>

        {/* PROPERTY */}
        <View style={styles.section}>
          <Text style={styles.heading}>Property</Text>
          <Text>{property.title}</Text>
          <Text>
            {property.address?.street}, {property.address?.area}
          </Text>
          <Text>
            {property.address?.town}, {property.address?.city},{" "}
            {property.address?.province}
          </Text>
        </View>

        {/* LEASE TERM */}
        <View style={styles.section}>
          <Text style={styles.heading}>Lease Term</Text>
          <Text>Start Date: {new Date(lease.startDate).toDateString()}</Text>
          <Text>
            End Date:{" "}
            {lease.endDate
              ? new Date(lease.endDate).toDateString()
              : "Open-ended"}
          </Text>
        </View>

        {/* RENT */}
        <View style={styles.section}>
          <Text style={styles.heading}>Rent</Text>
          <Text>
            Monthly Rent: {lease.rentCurrency}{" "}
            {lease.rentAmount.toLocaleString()}
          </Text>
          <Text>Rent Due Day: {lease.dueDay} of each month</Text>
          <Text>Frequency: {lease.rentFrequency}</Text>
        </View>

        {/* DEPOSIT */}
        <View style={styles.section}>
          <Text style={styles.heading}>Deposit</Text>
          {lease.depositAmount ? (
            <>
              <Text>
                Deposit Amount: {lease.depositCurrency}{" "}
                {lease.depositAmount.toLocaleString()}
              </Text>
              <Text>Deposit Held: {lease.depositHeld ? "Yes" : "No"}</Text>
            </>
          ) : (
            <Text>No deposit paid.</Text>
          )}
        </View>

        {/* BASIC TERMS */}
        <View style={styles.section}>
          <Text style={styles.heading}>Terms & Conditions</Text>
          <Text style={styles.line}>• The Tenant shall pay rent on or before the due date.</Text>
          <Text style={styles.line}>• The Tenant shall maintain the property in good condition.</Text>
          <Text style={styles.line}>• The Tenant is responsible for utility bills unless otherwise stated.</Text>
          <Text style={styles.line}>• The Landlord may enter the property with 24 hours notice.</Text>
          <Text style={styles.line}>• The Deposit may be used for damages or unpaid rent.</Text>
        </View>

        {/* SIGNATURES */}
        <View style={styles.section}>
          <Text style={styles.heading}>Signatures</Text>

          <View style={{ marginTop: 20 }}>
            <Text>Landlord: ________________________</Text>
            <Text>Date: _____________________________</Text>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text>Tenant: __________________________</Text>
            <Text>Date: _____________________________</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
