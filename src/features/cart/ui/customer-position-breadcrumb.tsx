import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CustomerPositionBreadcrumb({
  canteen_name,
  floor,
  table_number,
}: {
  canteen_name: string;
  floor: number;
  table_number: number;
}) {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>{canteen_name}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Lantai {floor}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Meja {table_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
