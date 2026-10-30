import { posts } from '../../data/posts';
import styles from './Post.module.css';

export default async function Post({ params }) {
  const { id } = await params;
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return <h1>No post found</h1>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.title}>{post.content}</p>
    </main>
  );
}
