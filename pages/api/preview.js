import { Amplify, withSSRContext } from "aws-amplify";
import awsExports from "src/aws-exports";
import { postsBySlug } from "src/graphql/queries";

Amplify.configure({ ...awsExports, ssr: true });

export default async function preview(req, res) {
  const SSR = withSSRContext({ req });

  try {
    await SSR.Auth.currentAuthenticatedUser();
  } catch (error) {
    return res.status(401).json(error);
  }

  res.setPreviewData({});

  const { slug } = req.query;

  if (!slug) {
    return res.end("Preview mode enabled");
  }

  const { data } = await SSR.API.graphql({
    query: postsBySlug,
    variables: { slug },
  });

  const [post] = data.postsBySlug.items;

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.redirect(`/posts/${post.slug}`);
}