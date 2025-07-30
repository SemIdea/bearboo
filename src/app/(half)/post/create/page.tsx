import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { CreatePostForm } from "./page.client";

const Page = () => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>
          Fill in the details below to create a new post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreatePostForm />
      </CardContent>
    </Card>
  );
};

export default Page;
