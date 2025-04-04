import { createDecoder, createSigner } from "fast-jwt";

const sign = createSigner({
  key: async () => "secret",
  expiresIn: "7d",
});

(async () => {
  const token = await sign({
    hello: "hello",
  });
  console.log(`Token :: ${token}`);

  const decoder = createDecoder();
  const decodedToken = decoder(token);

  console.log(`Decoded token value :: ${JSON.stringify(decodedToken)}`);
}
)();
