import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BlockDetailsService } from './block-details.service';
import { CreateBlockDetailDto } from './dto/create-block-detail.dto';
import { UpdateBlockDetailDto } from './dto/update-block-detail.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('block-details')
export class BlockDetailsController {
  constructor(private readonly blockDetailsService: BlockDetailsService) { }

  @Post()
  create(@Body() createBlockDetailDto: CreateBlockDetailDto) {
    return this.blockDetailsService.create(createBlockDetailDto);
  }

  
  @Post('submit')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'certificate', maxCount: 1 },
        { name: 'image', maxCount: 10 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/site-readiness/',
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${unique}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();

          const imageTypes = ['.jpg', '.jpeg', '.png'];
          const certTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

          if (file.fieldname === 'image') {
            if (!imageTypes.includes(ext)) {
              return cb(
                new Error('Only JPG, JPEG, PNG files are allowed for images'),
                false,
              );
            }
          }

          if (file.fieldname === 'certificate') {
            if (!certTypes.includes(ext)) {
              return cb(
                new Error(
                  'Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed for certificates',
                ),
                false,
              );
            }
          }

          cb(null, true);
        },
      },
    ),
  )
  async submit(
    @UploadedFiles()
    files: {
      certificate?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    const certFilename = files.certificate?.[0]?.filename;
    const imageFilenames = files.image?.map((file) => file.filename) || [];

    // Just an example log:
    console.log({ certFilename, imageFilenames });

    return this.blockDetailsService.saveSubmission(body, files);
  }

  @Get('readiness-data/:projectId/:blockId')
  getReadinessData(@Param('projectId') projectId: string, @Param('blockId') blockId: string) {
    return this.blockDetailsService.getReadinessData(projectId, blockId);
  }

  @Get('completion-status/:projectId/:blockId')
  async getCompletionStatus(
    @Param('projectId') projectId: string,
    @Param('blockId') blockId: string
  ) {
    const completedStatuses = await this.blockDetailsService.getCompletedReadinessPoints(projectId, blockId);
    return completedStatuses.map(status => status.site_readiness_activity_id);
  }

  @Get()
  findAll() {
    return this.blockDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockDetailDto: UpdateBlockDetailDto) {
    return this.blockDetailsService.update(+id, updateBlockDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockDetailsService.remove(+id);
  }
}
