const express = require("express");
const app = express();
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "calculate-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const plus = (n1, n2) => n1 + n2;
const sub = (n1, n2) => n1 - n2;
const mul = (n1, n2) => n1 * n2;
const div = (n1, n2) => n1 / n2;

// Helper function to handle request and response
const handleArithmeticOperation = (req, res, operation) => {
  try {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
      logger.error("Invalid input parameters");
      throw new Error("Invalid input parameters");
    }

    let result;
    switch (operation) {
      case "plus":
        result = plus(num1, num2);
        break;
      case "sub":
        result = sub(num1, num2);
        break;
      case "mul":
        result = mul(num1, num2);
        break;
      case "div":
        if (num2 === 0) {
          logger.error("Division by zero");
          throw new Error("Division by zero");
        }
        result = div(num1, num2);
        break;
      default:
        throw new Error("Invalid operation");
    }

    logger.info(
      `Operation ${operation} executed with num1: ${num1}, num2: ${num2}`
    );
    res.status(200).json({ statusCode: 200, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500, error: error.toString() });
  }
};

app.get("/plus", (req, res) => handleArithmeticOperation(req, res, "plus"));
app.get("/sub", (req, res) => handleArithmeticOperation(req, res, "sub"));
app.get("/mul", (req, res) => handleArithmeticOperation(req, res, "mul"));
app.get("/div", (req, res) => handleArithmeticOperation(req, res, "div"));

const port = 3040;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
