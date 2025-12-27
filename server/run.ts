import { createServer } from "./index";

const port = process.env.PORT || 3000;
const app = createServer();

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
