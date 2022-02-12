/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';
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

    const nextPageData = await fetch(nextPage).then(result => result.json());
    const nextPageProps = {
      next_page: nextPageData.next_page,
      results: nextPageData.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        };
      }),
    };

    setPosts([...posts, nextPageProps]);
  }

  return (
    <main className={styles.containerHome}>
      {posts.map(item =>
        item.results.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>
              <strong>{post.data.subtitle}</strong>
              <div className={styles.postDetails}>
                <div className={styles.postDate}>
                  <FiCalendar width={20} height={20} color="#bbbbbb" />
                  {String(
                    format(new Date(post.first_publication_date), 'dd MMM yyyy')
                  ).toLowerCase()}
                </div>
                <div className={styles.postAuthor}>
                  <FiUser color="#bbbbbb" />
                  {post.data.author}
                </div>
              </div>
            </a>
          </Link>
        ))
      )}

      {posts[posts.length - 1].next_page && (
        <button
          type="button"
          className={styles.buttonLoadPosts}
          onClick={handlePosts}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

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
        first_publication_date: post.first_publication_date,
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
