import { App, initializeApp } from "./app.config";

import { File } from "./file.model";
import { FileData } from "./file-data.model";

const routesGenerator = ({ app, dataSource, upload }: App) => {
  const filesRoutes = () => {
    const fileRepo = dataSource.getRepository(File);
    const dataFileRepo = dataSource.getRepository(FileData);
    const blockSize = 1048576;

    app.post("/files", upload.single("file"), async (req, res) => {
      if (!req.file) {
        res.send(`not ok `);
        return;
      }

      const quantBlocks = Math.floor(req.file.size / blockSize);

      const file = fileRepo.create({
        name: req.file?.originalname,
      });

      await fileRepo.save(file);

      let start = 0;
      let end = blockSize;
      const blocks = [];

      for (let i = 0; i <= quantBlocks; i++) {
        if (i) {
          end = blockSize * i;
        }

        const block = dataFileRepo.create({
          fileId: file.id,
          id: i,
          data: req.file.buffer.subarray(start, end),
        });

        blocks.push(block);

        start = end + 1;
      }

      await dataFileRepo.save(blocks);

      res.send("ok");
    });
  };

  filesRoutes();
};

const main = async () => {
  initializeApp({ routesGenerator });
  console.log("app iniciado!");
};

main();
