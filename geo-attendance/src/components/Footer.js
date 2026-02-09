export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} Geo Attendance System. All rights reserved.</p>
    </footer>
  );
}

const styles = {
  footer: {
    textAlign: "center",
    padding: "10px 0",
    background: "#f0f0f0",
    position: "fixed",
    bottom: 0,
    width: "100%",
  },
};
