import { IconFile, IconFolder } from '@tabler/icons-react';
import React, { useState } from 'react';

const treeData = [
  {
    label: 'Folder1',
    children: [
      {
        label: 'Document 1-1',
        children: [
          {
            label: 'Document-0-1.doc',
          },
          {
            label: 'Document-0-2.doc',
          },
        ],
      },
    ],
  },
  {
    label: 'Folder2',
    children: [
      {
        label: 'document1.doc',
      },
      {
        label: 'document-2.doc',
      },
    ],
  },
];


interface TreeProps {
  treeData: TreeNodeData[] | TreeNodeData; // Allow a single node or an array of nodes
}
interface TreeNodeProps {
  node: TreeNodeData;
}

interface TreeNodeData {
  label: string;
  children?: TreeNodeData[];
  isFile?: boolean; // Add isFile property
}

const setFileFlag = (node: TreeNodeData) => {
  if (!node.children) {
    node.isFile = true;
  } else {
    node.children.forEach((childNode) => {
      setFileFlag(childNode);
    });
  }
};

// Set the isFile flag for each node in treeData
treeData.forEach((node) => {
  setFileFlag(node);
});

const TreeNode: React.FC<TreeNodeProps> = ({ node }) => {
  const { children, label, isFile } = node;
  const [showChildren, setShowChildren] = useState(false);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };

  return (
    <>
      <div onClick={handleClick} style={{ marginBottom: '10px' }}>
        <span className="ml-1 flex flex-row items-stretch ">
          {isFile ? <IconFile size={16} /> : <IconFolder size={16} />}
          {label}
        </span>
      </div>
      {children && children.length > 0 && showChildren && (
        <ul className="pl-2 border-l-[1px] border-solid border-slate-500">
          {children.map((childNode, index) => (
            <TreeNode node={childNode} key={index} />
          ))}
        </ul>
      )}
    </>
  );
};



const Tree: React.FC<TreeProps> = ({ treeData }) => {
  const dataArray = Array.isArray(treeData) ? treeData : [treeData]; // Ensure treeData is an array
  return (
    <ul>
      {dataArray.map((node, index) => (
        <TreeNode node={node} key={index} />
      ))}
    </ul>
  );
};

const Testing: React.FC = () => {
  return (
    <div className="text-white">
      <Tree treeData={treeData} />
    </div>
  );
};

export default Testing;
