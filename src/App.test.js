import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login heading", () => {
  render(<App />);
  const heading = screen.getByRole("heading", { name: /s a r s/i });
  expect(heading).toBeInTheDocument();
});
