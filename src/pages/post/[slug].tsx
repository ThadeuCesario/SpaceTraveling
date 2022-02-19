/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Utterances from '../../components/Utterances';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface BeforePost {
  uid: string | null;
  title: string;
}

interface AfterPost {
  uid: string | null;
  title: string;
}

interface PostProps {
  post: Post;
  preview: unknown;
  beforePost: BeforePost;
  afterPost: AfterPost;
}

export default function Post({
  post,
  preview,
  beforePost,
  afterPost,
}: PostProps) {
  const router = useRouter();
  const dateFormated = String(
    format(new Date(post.first_publication_date), 'dd MMM yyyy')
  ).toLowerCase();

  const lastChangeDate = String(
    format(new Date('2021-03-25T19:25:28+0000'), "dd MMM yyyy 'às' HH:mm")
  ).toLowerCase();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <section>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />

      <div className={styles.content}>
        <h1>{post.data.title}</h1>
        <div className={styles.containerPostDetails}>
          <div className={styles.postDetails}>
            <div>
              <FiCalendar color="#bbb" />
              <span>{dateFormated}</span>
            </div>
            <div>
              <FiUser color="#bbb" />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock color="#bbb" />
              <span>4 min</span>
            </div>
          </div>
          <strong>* editado em {lastChangeDate}</strong>
        </div>
        <div className={styles.containerContent}>
          {post.data.content.map(info => (
            <div key={Math.random()}>
              <h1>{info.heading}</h1>
              <div>
                {info.body.map(task => (
                  <p key={Math.random()}>{task.text}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.division} />
      <div className={styles.containerSliderPosts}>
        {afterPost?.title && (
          <div className={`${styles.sliderPost} ${styles.left}`}>
            <strong>{afterPost.title}</strong>
            <Link href={`${afterPost.uid}`}>
              <a className={styles.left}>Post anterior</a>
            </Link>
          </div>
        )}
        {beforePost?.title && (
          <div className={`${styles.sliderPost} ${styles.right}`}>
            <strong>{beforePost.title}</strong>
            <Link href={`${beforePost.uid}`}>
              <a className={styles.right}>Próximo post</a>
            </Link>
          </div>
        )}
      </div>
      <Utterances />
    </section>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);
  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const previewRef = previewData ? previewData.ref : null;
  const refOption = previewRef ? { ref: previewRef } : {};
  const response = await prismic.getByUID('post', String(slug), refOption);
  let responseAfterPost = null;
  let responseBeforePost = null;

  if (!preview) {
    responseAfterPost = await prismic.query(
      [
        Prismic.predicates.at('document.type', 'post'),
        Prismic.predicates.dateAfter(
          'document.last_publication_date',
          response.last_publication_date
        ),
      ],
      {
        fetch: ['post.title'],
        pageSize: 1,
      }
    );

    responseBeforePost = await prismic.query(
      [
        Prismic.predicates.at('document.type', 'post'),
        Prismic.predicates.dateBefore(
          'document.last_publication_date',
          response.last_publication_date
        ),
      ],
      {
        fetch: ['post.title'],
        pageSize: 1,
      }
    );
  }

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      preview,
      beforePost: !preview
        ? {
            uid: responseBeforePost.results.length
              ? responseBeforePost.results[0].uid
              : null,
            title: responseBeforePost.results.length
              ? responseBeforePost.results[0].data.title
              : null,
          }
        : null,
      afterPost: !preview
        ? {
            uid: responseAfterPost.results.length
              ? responseAfterPost.results[0].uid
              : null,
            title: responseAfterPost.results.length
              ? responseAfterPost.results[0].data.title
              : null,
          }
        : null,
    },
  };
};
