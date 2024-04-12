import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.get("/oauth2callback", (req: Request, res: Response) => {
  const code = req.query.code as string;
  console.log("Código de autorización:", code);
  res.send(
    `<h1>Autorización exitosa. Puede cerrar esta ventana del navegador.</h1>
    <p>${code}</p>`
  );
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
