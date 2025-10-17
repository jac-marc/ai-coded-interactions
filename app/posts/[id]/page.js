import { posts } from '../../data/posts';
import styles from './Post.module.css';

export default function Post ({ params }) {
    const post = posts.find((post) => post.id === params.id);
    
    if (!post) {
        return <h1>No post found</h1>
    }
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>{post.title}</h1>
            <h1 className={styles.title}>{post.content}</h1>
        </main>
    );
}