import SalaryArrearCalculator from "./components/SalaryArrearCalculator";
import PayMatrixImage from "./components/PayMatrixImage";

function App() {
  return (
    <>
      <h2 style={{ textAlign: "center" }}>
        📊 ROPA-2020 Salary Arrear Calculator
      </h2>

      <SalaryArrearCalculator />
      <PayMatrixImage />
    </>
  );
}

export default App;
