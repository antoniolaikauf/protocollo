const crypto = require("crypto");

function Entopy() {
  const entropy = crypto.randomBytes(16).toString("hex");
  let entropy_bits = "";
  for (let i = 0; i < entropy.length; i += 2) {
    const chunk = entropy.slice(i, i + 2);
    entropy_bits += parseInt(chunk, 16).toString(2).padStart(8, "0");
  }
  return entropy_bits;
}

const bits_entropy = Entopy();
const checksum = crypto.createHash("sha256").update(bits_entropy).digest("hex").slice(0, 1);
const bits_checksum = bits_entropy + parseInt(checksum, 16).toString(2).padStart(4, "0");
console.log(bits_checksum);
