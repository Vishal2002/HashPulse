import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const GET_USER_VIEWS = gql`
  query GetUserViews($username: String!) {
    user(username: $username) {
      name
      profilePicture
      publications(first:1) {
        edges {
          node {
            posts(first:50) {
              edges {
                node {
                  title
                  views
                  publishedAt
                }
              }
            }
          }
        }
      }
    }
  }
`;

const HashPulse = () => {
  const [username, setUsername] = useState('');
  const [queryUsername, setQueryUsername] = useState('');

  const { loading, error, data } = useQuery(GET_USER_VIEWS, {
    variables: { username: queryUsername },
    skip: !queryUsername,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setQueryUsername(username);
  };

  const processData = () => {
    if (!data) return [];
    const posts = data.user.publications.edges[0].node.posts.edges;
    return posts.map(({ node }) => ({
      title: node.title,
      views: node.views,
      date: new Date(node.publishedAt).toLocaleDateString(),
    }));
  };

  const totalViews = data
    ? data.user.publications.edges[0].node.posts.edges.reduce((sum, { node }) => sum + node.views, 0)
    : 0;

  const shareOnX = () => {
    const text = `Check out my Hashnode analytics! I've reached ${totalViews} total views. 🚀 #HashnodePulse`;
    const url = `http://localhost:3000/generate-image?username=${queryUsername}&views=${totalViews}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-4">
      <Card className="mb-4">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center text-purple-600">HashPulse</h1>
          <p className="text-center text-gray-500">Your Hashnode Heartbeat</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Hashnode username"
              className="flex-grow"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Analyze'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {data && (
        <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <img src={data.user.profilePicture} alt={data.user.name} className="w-16 h-16 rounded-full mr-4 border-2 border-white" />
              <div>
                <h2 className="text-2xl font-semibold">{data.user.name}'s Pulse</h2>
                <p className="text-xl">Total Views: <span className="font-bold">{totalViews}</span></p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#fff" strokeWidth={2} dot={{ fill: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>

            <Button onClick={shareOnX} className="mt-4 bg-black hover:bg-gray-800 text-white flex items-center">
              <img  src="/twitter.png" alt="X (Twitter) logo" width={20} height={20} className="mr-2" />
              Share on X
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HashPulse;