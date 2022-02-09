/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const dateFormated = String(
    format(new Date('2021-03-25T19:25:28+0000'), 'dd MMM yyyy')
  ).toLowerCase();

  return (
    <div>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <h1>{post.data.title}</h1>
      <div>
        <div>
          <FiCalendar color="#bbbbbb" />
          <span>{dateFormated}</span>
        </div>
        <div>
          <FiUser color="#bbbbbb" />
          <span>{post.data.author}</span>
        </div>
        <div>
          <FiClock color="#bbbbbb" />
          <span>4 min</span>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // console.log('getStaticPaths', props);
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    first_publication_date: response.first_publication_date || null,
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
    },
  };
};
