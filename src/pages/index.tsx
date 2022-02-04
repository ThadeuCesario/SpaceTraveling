/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination[]>([postsPagination]);

  async function handlePosts() {
    const nextPage = posts[posts.length - 1].next_page;

    const nextPageData = await fetch(nextPage).then(result =>
      result.text().then(response => {
        const jsonResponse = JSON.parse(response);
        return {
          next_page: jsonResponse.next_page,
          results: jsonResponse.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date:
                format(new Date(post.last_publication_date), 'dd MMM yyyy') ||
                null,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          }),
        };
      })
    );

    setPosts([...posts, nextPageData]);
  }

  return (
    <main className={styles.containerHome}>
      {posts.map(item =>
        item.results.map(post => (
          <div className={styles.post} key={post.uid}>
            <h1>{post.data.title}</h1>
            <strong>{post.data.subtitle}</strong>
            <div className={styles.postDetails}>
              <div className={styles.postDate}>
                <FiCalendar width={20} height={20} color="#bbbbbb" />
                {post.first_publication_date}
              </div>
              <div className={styles.postAuthor}>
                <FiUser color="#bbbbbb" />
                {post.data.author}
              </div>
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        className={styles.buttonLoadPosts}
        onClick={handlePosts}
      >
        Carregar mais posts
      </button>
    </main>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date:
          format(new Date(post.last_publication_date), 'dd MMM yyyy') || null,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
