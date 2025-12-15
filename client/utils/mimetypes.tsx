import {
  IconFileInfo,
  IconFileText,
  IconFileTypeCss,
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypeDocx,
  IconFileTypeHtml,
  IconFileTypeJpg,
  IconFileTypePdf,
  IconFileTypePhp,
  IconFileTypePng,
  IconFileTypePpt,
  IconFileTypeSvg,
  IconFileTypeTs,
  IconFileTypeTxt,
  IconFileTypeXls,
  IconFileTypeXml,
  IconFileTypeZip,
  IconMovie,
  IconMusic,
  IconPhoto
} from "@tabler/icons-react";

const mimeIcons: Record<string, any> = {
  "application/pdf": <IconFileTypePdf />,
  "application/msword": <IconFileTypeDoc />,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": <IconFileTypeDocx />,
  "application/vnd.ms-excel": <IconFileTypeXls />,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": <IconFileTypeXls />,
  "application/vnd.ms-powerpoint": <IconFileTypePpt />,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": <IconFileTypePpt />,
  "image/bmp": <IconPhoto />,
  "text/css": <IconFileTypeCss />,
  "text/csv": <IconFileTypeCsv />,
  "text/html": <IconFileTypeHtml />,
  "image/jpeg": <IconFileTypeJpg />,
  "application/x-httpd-php": <IconFileTypePhp />,
  "image/png": <IconFileTypePng />,
  "image/svg+xml": <IconFileTypeSvg />,
  "video/mp2t": <IconFileTypeTs />,
  "text/plain": <IconFileTypeTxt />,
  "application/xml": <IconFileTypeXml />,
  "text/xml": <IconFileTypeXml />,
  "application/atom+xml": <IconFileTypeXml />,
  "application/zip": <IconFileTypeZip />,
  "image": <IconPhoto />,
  "video": <IconMovie />,
  "audio": <IconMusic />,
  "text": <IconFileText />,
  "application": <IconFileInfo />
};

type Mimetype = keyof typeof mimeIcons | string;

/**
 * Gets a file icon component on the mime type - if no icon is found, finds a general icon based on the type
 * @param mimeType
 */
export const getIconComponent = (mimeType: Mimetype) => {
  console.log("mimeType: ", mimeType);
  if (!mimeType) {
    return <IconFileInfo />;
  }

  // find the icon where the mimetype includes the key
  const key = Object.keys(mimeIcons).find(key => mimeType.includes(key));
  if (key) {
    return mimeIcons[key as Mimetype];
  }

  // if no icon is found, find the icon based on the type
  const type = mimeType.split("/")[0];
  const icon = mimeIcons[type as Mimetype];
  if (icon) {
    return icon;
  }

  // if no icon is found, return the default icon
  return <IconFileInfo />;
};