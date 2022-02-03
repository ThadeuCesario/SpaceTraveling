/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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

// {
//   next_page: ,
//   results: [
//     {
//       uid?: string;
//       first_publication_date: string | null;
//       data: {
//         title: string;
//         subtitle: string;
//         author: string;
//       };
//     }
//   ]
// }

export default function Home({ postsPagination }: HomeProps) {
  console.log(postsPagination);
  return (
    <main className={styles.containerHome}>
      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <strong>Pensando em sincronização em vez de ciclos de vida.</strong>
        <div className={styles.postDetails}>
          <div className={styles.postDate}>
            <FiCalendar width={20} height={20} color="#bbbbbb" />
            15 Abr 2021
          </div>
          <div className={styles.postAuthor}>
            <FiUser color="#bbbbbb" />
            Joseph Oliveira
          </div>
        </div>
      </div>

      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <strong>Pensando em sincronização em vez de ciclos de vida.</strong>
        <div className={styles.postDetails}>
          <div className={styles.postDate}>
            <FiCalendar width={20} height={20} color="#bbbbbb" />
            15 Abr 2021
          </div>
          <div className={styles.postAuthor}>
            <FiUser color="#bbbbbb" />
            Joseph Oliveira
          </div>
        </div>
      </div>

      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <strong>Pensando em sincronização em vez de ciclos de vida.</strong>
        <div className={styles.postDetails}>
          <div className={styles.postDate}>
            <FiCalendar width={20} height={20} color="#bbbbbb" />
            15 Abr 2021
          </div>
          <div className={styles.postAuthor}>
            <FiUser color="#bbbbbb" />
            Joseph Oliveira
          </div>
        </div>
      </div>
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

  console.log(postsResponse);

  // const postsPagination = postsResponse.results.map(post => {
  //   // return {
  //   //   slug: post.uid,
  //   //   title: RichText.asText(post.data.title),
  //   //   subtitle: RichText.asText(post.data.subtitle),
  //   //   author: RichText.asText(post.data.author),
  //   //   updatedAt: format(new Date(post.last_publication_date), "dd 'de' YYYY"),
  //   // };
  //   console.log('post', post);
  //   return {
  //     next_page:
  //   };
  // });

  return {
    props: {},
  };
};
