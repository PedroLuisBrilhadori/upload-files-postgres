import "reflect-metadata";
import { App, initializeApp } from "./app.config";

import { File } from "./file.model";
import { FileData } from "./file-data.model";

const routesGenerator = ({ app, dataSource, upload }: App) => {
  const filesRoutes = () => {
    const fileRepo = dataSource.getRepository(File);
    const dataFileRepo = dataSource.getRepository(FileData);
    const blockSize = 1048576 * 5;

    app.post("/files", upload.single("file"), async (req, res) => {
      if (!req.file) {
        res.send(`not ok `);
        return;
      }

      const quantBlocks = req.file.size < blockSize ? 1 : Math.round(req.file.size / blockSize);

      const file = fileRepo.create({
        name: req.file?.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        length: quantBlocks,
      });

      await fileRepo.save(file);

      let start = 0;
      let end = blockSize;
      const blocks = [];

      for (let i = 0; i < quantBlocks; i++) {
        if (i) {
          const sum = i + 1;
          if (sum == quantBlocks) {
            end = req.file.buffer.length;
          } else {
            end = blockSize * sum;
          }
        }

        const buffer = req.file.buffer.subarray(start, end); 
        const data = buffer.toString('base64');

        const block = dataFileRepo.create({
          fileId: file.id,
          id: i,
          data,
        });

        blocks.push(block);

        start = end;
      }

      await dataFileRepo.save(blocks);

      res.send(`ok, fileid: ${file.id}`);
    });
  };

  /** @deprecated não utiliza cursor para o stream de data_blocks */
  const downloadFiles = () => {
    const fileRepo = dataSource.getRepository(File);
    const dataFileRepo = dataSource.getRepository(FileData);

    app.get(`/files/:id`, async (req, res) => {
      const fileId = req.params.id;

      const file = await fileRepo.findOne({
        select: { name: true, size: true, type: true, length: true },
        where: { id: fileId },
      });

      if (!file) {
        res.send("no ok");
        return;
      }

      res.writeHead(200, {
        "Content-Type": file.type,
        "Transfer-Encoding": "chunked",
        'Content-Disposition': `attachment; filename="${file.name}"`,
      });

      for (let i = 0; i < file.length; i++) {
        const chunk = await dataFileRepo.findOneOrFail({
          select: { data: true },
          where: {
            fileId,
            id: i,
          },
        });

        res.write(chunk.data);
      }

      res.end();
    });
  };

  const streamPosgres = () => {
    const fileRepo = dataSource.getRepository(File);
    const dataFileRepo = dataSource.getRepository(FileData);
    const builder = dataFileRepo.createQueryBuilder('byte');

    const path = 'C:/';

    app.get(`/stream/:id`, async (req, res) => {
      const fileId = req.params.id;

      const file = await fileRepo.findOne({
        select: { name: true, size: true, type: true, length: true },
        where: { 
          path, 
          id: fileId,
         },
      });

      if (!file) {
        res.send("no ok");
        return;
      }

      res.writeHead(200, {
        "Content-Type": file.type,
        "Transfer-Encoding": "chunked",
        // 'Content-Disposition': `attachment; filename="${file.name}"`,
      });

      const query = builder.select([
        "byte.data"
      ])
      .where("byte.path = :path", {path})
      .andWhere("byte.file_id = :fileId", {fileId})
      .orderBy('byte.id', 'ASC');


      const stream = await query.stream();

      stream.on('data', (data: {byte_data: string}) => {
        const buffer = Buffer.from(data.byte_data, 'base64'); 
        res.write(buffer);
      });


      stream.on('end', () => {
        res.end();
      })
    });
  }

  streamPosgres();
  filesRoutes();
};

const main = async () => {
  initializeApp({ routesGenerator });
  console.log("app iniciado!");
};

main();
