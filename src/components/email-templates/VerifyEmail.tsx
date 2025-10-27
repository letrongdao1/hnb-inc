import { Body, Container, Head, Heading, Html, Link, Section, Text } from "@react-email/components";
import { AcmeLogo } from "../logo/logo";

interface PlaidVerifyIdentityEmailProps {
  validationCode?: string;
}

export const PlaidVerifyIdentityEmail = ({ validationCode }: PlaidVerifyIdentityEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Container style={{ margin: "0 auto" }}>
          <AcmeLogo />
        </Container>
        <Text style={tertiary}>Xác thực tài khoản HNB Hub</Text>
        <Heading style={secondary}>
          Nhập mã xác thực sau để xác thực địa chỉ email của bạn liên kết với HNB Hub:
        </Heading>
        <Section style={codeContainer}>
          <Text style={code}>{validationCode}</Text>
        </Section>
        <Text style={paragraph}>Không phải email này?</Text>
        <Text style={paragraph}>
          Liên hệ{" "}
          <Link href={`mailto:${process.env.HNB_EMAIL_ADDRESS}`} style={link}>
            {process.env.HNB_EMAIL_ADDRESS}
          </Link>{" "}
          nếu bạn không yêu cầu gửi mã này.
        </Text>
      </Container>
      <Text style={footer}>Phát triển bởi phòng IT của HNB.</Text>
    </Body>
  </Html>
);

PlaidVerifyIdentityEmail.PreviewProps = {
  validationCode: "144833",
} as PlaidVerifyIdentityEmailProps;

export default PlaidVerifyIdentityEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  maxWidth: "360px",
  margin: "0 auto",
  padding: "68px 0 130px",
};

const tertiary = {
  color: "#0a85ea",
  fontSize: "11px",
  fontWeight: 700,
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  height: "16px",
  letterSpacing: "0",
  lineHeight: "16px",
  margin: "16px 8px 8px 8px",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
};

const secondary = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "24px",
  marginBottom: "0",
  marginTop: "0",
  textAlign: "center" as const,
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};

const code = {
  color: "#000",
  fontFamily: "HelveticaNeue-Bold",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  display: "block",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#444",
  fontSize: "15px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "23px",
  padding: "0 40px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#444",
  textDecoration: "underline",
};

const footer = {
  color: "#000",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0",
  lineHeight: "23px",
  margin: "0",
  marginTop: "20px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
};
