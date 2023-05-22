import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { graphql } from 'cm6-graphql';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { schemaFromExecutor } from '@graphql-tools/wrap';
import { GraphQLSchema } from 'graphql/type';
import { Col, Row, Button, Space, Tooltip, Tabs } from 'antd';
import { BookTwoTone, CaretRightFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const url = 'https://rickandmortyapi.com/graphql';
const headerGraphqlRequest = `{'Content-type': 'application/json'}`;

function QueryEditor() {
  const [myGraphQLSchema, setMyGraphQLSchema] = useState<GraphQLSchema | undefined>(undefined);
  const [response, setResponse] = useState<string>('');
  const [value, setValue] = useState(`query {}`);
  const [variables, setVariables] = useState(`{}`);
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const fetchSchema = async () => {
        const remoteExecutor = buildHTTPExecutor({ endpoint: url });

        const postsSubschema = {
          schema: await schemaFromExecutor(remoteExecutor),
          executor: remoteExecutor,
        };
        setMyGraphQLSchema(postsSubschema.schema);
      };
      fetchSchema();
    } catch (error) {
      setMyGraphQLSchema(undefined);
    }
  }, []);

  const onChangeValue = React.useCallback((value: string) => {
    setValue(value);
  }, []);

  const onChangeVariables = React.useCallback((value: string) => {
    setVariables(value);
  }, []);

  const makeRequest = async (query: string): Promise<string> => {
    const reguestBody = {
      query,
      variables: JSON.parse(variables),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(reguestBody),
    });
    return await res.json();
  };

  const handleDocsClick = () => {
    setIsDocsVisible(!isDocsVisible);
  };

  const handleSendRequest = async () => {
    const data = await makeRequest(value);
    if (data) setResponse(data);
  };

  const tabsItems = [
    {
      key: '1',
      label: t('graphiql.variables'),
      children: (
        <CodeMirror
          value={variables}
          height="100px"
          width="100%"
          onChange={onChangeVariables}
          className="editor-visible"
        />
      ),
    },
    {
      key: '2',
      label: t('graphiql.headers'),
      children: (
        <CodeMirror
          value={headerGraphqlRequest}
          height="100px"
          width="100%"
          readOnly={true}
          className="editor-visible"
        />
      ),
    },
  ];

  return (
    <>
      <>
        <Row gutter={24} style={{ marginBottom: '10px' }}>
          <Col>
            <Space direction="vertical">
              <Row>
                <Tooltip title={t('graphiql.query') || 'Execute query'}>
                  <Button
                    type="primary"
                    icon={<CaretRightFilled />}
                    onClick={handleSendRequest}
                  ></Button>
                </Tooltip>
              </Row>
              <Row>
                <Tooltip title={t('graphiql.docs') || 'Docs'} placement="bottom">
                  <Button type="default" icon={<BookTwoTone />} onClick={handleDocsClick}></Button>
                </Tooltip>
              </Row>
            </Space>
          </Col>

          <Row gutter={24} style={{ width: 'calc(100% - 60px)' }}>
            <Col span={isDocsVisible ? 8 : 0}>
              {!myGraphQLSchema ? (
                <p>Sorry server return Error Doc</p>
              ) : (
                <iframe
                  className={isDocsVisible ? 'docs-visible' : 'docs-hidden'}
                  style={{ width: '100%', height: '600px' }}
                  src="/docs/index.html"
                  title="GraphQL documentation"
                ></iframe>
              )}
            </Col>
            <Col span={isDocsVisible ? 8 : 12}>
              <CodeMirror
                value={value}
                height="200px"
                width="100%"
                extensions={[graphql(myGraphQLSchema)]}
                onChange={onChangeValue}
              />
              <Tabs centered items={tabsItems} />
            </Col>

            <Col span={isDocsVisible ? 8 : 12}>
              <CodeMirror
                value={response ? JSON.stringify(response, null, 2) : ''}
                readOnly={true}
              />
            </Col>
          </Row>
        </Row>
      </>
    </>
  );
}

export default QueryEditor;
